/**
 * The Game Crafter API Client
 * REST API docs: https://www.thegamecrafter.com/developer/
 * Base URL: https://www.thegamecrafter.com/api
 */

const TGC_BASE = "https://www.thegamecrafter.com/api";

interface TGCSession {
  id: string;
  user_id: string;
}

interface TGCFile {
  id: string;
  name: string;
  uri: string;
}

interface TGCGame {
  id: string;
  name: string;
  designer_id: string;
}

interface TGCDeck {
  id: string;
  name: string;
}

interface TGCCard {
  id: string;
  name: string;
}

interface TGCCart {
  id: string;
}

interface TGCCartItem {
  id: string;
}

interface TGCAddress {
  id: string;
}

interface TGCReceipt {
  id: string;
  status: string;
}

interface TGCShipment {
  id: string;
  tracking_number: string;
  status: string;
}

interface TGCFolder {
  id: string;
  name: string;
}

interface TGCDesigner {
  id: string;
  name: string;
}

type TGCResponse<T> = { result: T };

class GameCrafterError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "GameCrafterError";
  }
}

async function tgcFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: Record<string, unknown> | FormData;
    sessionId?: string;
  } = {}
): Promise<T> {
  const { method = "GET", body, sessionId } = options;
  const url = new URL(`${TGC_BASE}${path}`);

  const headers: Record<string, string> = {};
  let fetchBody: string | FormData | undefined;

  if (body instanceof FormData) {
    if (sessionId) body.append("session_id", sessionId);
    fetchBody = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    const payload = sessionId ? { ...body, session_id: sessionId } : body;
    fetchBody = JSON.stringify(payload);
  } else if (sessionId) {
    if (method === "GET") {
      url.searchParams.set("session_id", sessionId);
    } else {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify({ session_id: sessionId });
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: fetchBody,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new GameCrafterError(
      `TGC API error ${res.status}: ${text}`,
      res.status,
      text
    );
  }

  const data = (await res.json()) as TGCResponse<T>;
  return data.result;
}

// Rate limiting: TGC allows 240 req/min (4/sec)
let lastRequestTime = 0;
const MIN_INTERVAL = 260; // ~3.8 req/sec to stay safe

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
}

async function tgcThrottled<T>(
  path: string,
  options: Parameters<typeof tgcFetch>[1] = {}
): Promise<T> {
  await throttle();
  return tgcFetch<T>(path, options);
}

// ---- Session Management ----

export async function createSession(): Promise<TGCSession> {
  const apiKey = process.env.TGC_API_KEY;
  const username = process.env.TGC_USERNAME;
  const password = process.env.TGC_PASSWORD;
  if (!apiKey || !username || !password) {
    throw new Error("TGC_API_KEY, TGC_USERNAME, and TGC_PASSWORD are required");
  }
  return tgcThrottled<TGCSession>("/session", {
    method: "POST",
    body: { api_key_id: apiKey, username, password },
  });
}

let _sessionCache: { session: TGCSession; expiresAt: number } | null = null;

export async function getSession(): Promise<TGCSession> {
  if (_sessionCache && Date.now() < _sessionCache.expiresAt) {
    return _sessionCache.session;
  }
  const session = await createSession();
  // Cache for 50 minutes (sessions last ~1 hour)
  _sessionCache = { session, expiresAt: Date.now() + 50 * 60 * 1000 };
  return session;
}

// ---- Designer ----

export async function getOrCreateDesigner(
  sessionId: string,
  userId: string,
  name: string
): Promise<TGCDesigner> {
  // Try to create a designer; if it already exists TGC may return it
  return tgcThrottled<TGCDesigner>("/designer", {
    method: "POST",
    body: { name, user_id: userId },
    sessionId,
  });
}

// ---- File Upload ----

export async function uploadFile(
  sessionId: string,
  folderId: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType = "image/png"
): Promise<TGCFile> {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("folder_id", folderId);
  formData.append("name", fileName);
  const blob = new Blob([fileBuffer as unknown as BlobPart], { type: contentType });
  formData.append("file", blob, fileName);

  await throttle();
  const res = await fetch(`${TGC_BASE}/file`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new GameCrafterError(`File upload failed: ${text}`, res.status, text);
  }
  const data = (await res.json()) as TGCResponse<TGCFile>;
  return data.result;
}

// ---- Folder ----

export async function createFolder(
  sessionId: string,
  name: string,
  userId: string
): Promise<TGCFolder> {
  return tgcThrottled<TGCFolder>("/folder", {
    method: "POST",
    body: { name, user_id: userId },
    sessionId,
  });
}

// ---- Game ----

export async function createGame(
  sessionId: string,
  params: {
    name: string;
    designerId: string;
    description?: string;
  }
): Promise<TGCGame> {
  return tgcThrottled<TGCGame>("/game", {
    method: "POST",
    body: {
      name: params.name,
      designer_id: params.designerId,
      short_description: params.description || "",
    },
    sessionId,
  });
}

// ---- Deck & Cards ----

export async function createPokerDeck(
  sessionId: string,
  params: {
    gameId: string;
    name: string;
    backFileId: string;
  }
): Promise<TGCDeck> {
  return tgcThrottled<TGCDeck>("/pokerdeck", {
    method: "POST",
    body: {
      game_id: params.gameId,
      name: params.name,
      back_id: params.backFileId,
    },
    sessionId,
  });
}

export async function createCard(
  sessionId: string,
  params: {
    deckId: string;
    name: string;
    faceFileId: string;
    quantity?: number;
  }
): Promise<TGCCard> {
  return tgcThrottled<TGCCard>("/pokercard", {
    method: "POST",
    body: {
      deck_id: params.deckId,
      name: params.name,
      face_id: params.faceFileId,
      quantity: params.quantity || 1,
    },
    sessionId,
  });
}

// ---- Booklet (for manuals/rules) ----

export async function createBooklet(
  sessionId: string,
  params: {
    gameId: string;
    name: string;
    size?: string;
  }
) {
  return tgcThrottled<{ id: string }>("/booklet", {
    method: "POST",
    body: {
      game_id: params.gameId,
      name: params.name,
      size: params.size || "Letter",
    },
    sessionId,
  });
}

export async function addBookletPage(
  sessionId: string,
  params: {
    bookletId: string;
    fileId: string;
    pageNumber: number;
  }
) {
  return tgcThrottled<{ id: string }>("/bookletpage", {
    method: "POST",
    body: {
      booklet_id: params.bookletId,
      file_id: params.fileId,
      page_number: params.pageNumber,
    },
    sessionId,
  });
}

// ---- Tuck Box ----

export async function createTuckBox(
  sessionId: string,
  params: {
    gameId: string;
    name: string;
    size?: string;
    frontFileId: string;
    backFileId: string;
  }
) {
  return tgcThrottled<{ id: string }>("/tuckbox", {
    method: "POST",
    body: {
      game_id: params.gameId,
      name: params.name,
      size: params.size || "PokerBridge",
      front_id: params.frontFileId,
      back_id: params.backFileId,
    },
    sessionId,
  });
}

// ---- Cart & Ordering ----

export async function getCart(sessionId: string): Promise<TGCCart> {
  return tgcThrottled<TGCCart>("/cart", {
    method: "GET",
    sessionId,
  });
}

export async function addToCart(
  sessionId: string,
  gameId: string,
  quantity = 1
): Promise<TGCCartItem> {
  return tgcThrottled<TGCCartItem>("/cartitem", {
    method: "POST",
    body: { game_id: gameId, quantity },
    sessionId,
  });
}

export async function createAddress(
  sessionId: string,
  params: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }
): Promise<TGCAddress> {
  return tgcThrottled<TGCAddress>("/address", {
    method: "POST",
    body: {
      name: params.name,
      address1: params.address,
      city: params.city,
      state: params.state,
      zip: params.zip,
      country: params.country,
    },
    sessionId,
  });
}

export async function checkout(
  sessionId: string,
  addressId: string
): Promise<TGCReceipt> {
  return tgcThrottled<TGCReceipt>("/cart/checkout", {
    method: "POST",
    body: { shipping_address_id: addressId },
    sessionId,
  });
}

// ---- Order Tracking ----

export async function getReceipt(
  sessionId: string,
  receiptId: string
): Promise<TGCReceipt> {
  return tgcThrottled<TGCReceipt>(`/receipt/${receiptId}`, {
    method: "GET",
    sessionId,
  });
}

export async function getShipment(
  sessionId: string,
  shipmentId: string
): Promise<TGCShipment> {
  return tgcThrottled<TGCShipment>(`/shipment/${shipmentId}`, {
    method: "GET",
    sessionId,
  });
}

// ---- High-level: Submit a complete game order ----

export interface GameOrderSpec {
  gameName: string;
  gameDescription: string;
  cardBackImage: Buffer;
  cardFaceImages: { name: string; image: Buffer; quantity?: number }[];
  boxFrontImage: Buffer;
  boxBackImage: Buffer;
  manualPages: Buffer[];
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  quantity: number;
}

export async function submitGameOrder(spec: GameOrderSpec): Promise<{
  tgcGameId: string;
  receiptId: string;
}> {
  const session = await getSession();
  const sid = session.id;
  const uid = session.user_id;

  // 1. Create folder for assets
  const folder = await createFolder(sid, `${spec.gameName}-assets`, uid);

  // 2. Create designer
  const designer = await getOrCreateDesigner(
    sid,
    uid,
    "Board Game Creator"
  );

  // 3. Create game
  const game = await createGame(sid, {
    name: spec.gameName,
    designerId: designer.id,
    description: spec.gameDescription,
  });

  // 4. Upload card back
  const cardBackFile = await uploadFile(
    sid,
    folder.id,
    "card-back.png",
    spec.cardBackImage
  );

  // 5. Create poker deck
  const deck = await createPokerDeck(sid, {
    gameId: game.id,
    name: `${spec.gameName} Deck`,
    backFileId: cardBackFile.id,
  });

  // 6. Upload and create each card
  for (const card of spec.cardFaceImages) {
    const file = await uploadFile(sid, folder.id, `${card.name}.png`, card.image);
    await createCard(sid, {
      deckId: deck.id,
      name: card.name,
      faceFileId: file.id,
      quantity: card.quantity,
    });
  }

  // 7. Upload box art
  const boxFront = await uploadFile(sid, folder.id, "box-front.png", spec.boxFrontImage);
  const boxBack = await uploadFile(sid, folder.id, "box-back.png", spec.boxBackImage);

  // 8. Create tuck box
  await createTuckBox(sid, {
    gameId: game.id,
    name: `${spec.gameName} Box`,
    frontFileId: boxFront.id,
    backFileId: boxBack.id,
  });

  // 9. Upload manual pages and create booklet
  if (spec.manualPages.length > 0) {
    const booklet = await createBooklet(sid, {
      gameId: game.id,
      name: `${spec.gameName} Manual`,
    });

    for (let i = 0; i < spec.manualPages.length; i++) {
      const pageFile = await uploadFile(
        sid,
        folder.id,
        `manual-page-${i + 1}.png`,
        spec.manualPages[i]
      );
      await addBookletPage(sid, {
        bookletId: booklet.id,
        fileId: pageFile.id,
        pageNumber: i + 1,
      });
    }
  }

  // 10. Add to cart
  await addToCart(sid, game.id, spec.quantity);

  // 11. Create shipping address
  const address = await createAddress(sid, spec.shipping);

  // 12. Checkout
  const receipt = await checkout(sid, address.id);

  return {
    tgcGameId: game.id,
    receiptId: receipt.id,
  };
}
