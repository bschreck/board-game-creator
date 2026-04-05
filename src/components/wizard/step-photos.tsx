"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ImagePlus, Users } from "lucide-react";

const MAX_PHOTO_WIDTH = 800;

function fileToBase64DataUri(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > MAX_PHOTO_WIDTH) {
        height = Math.round(height * (MAX_PHOTO_WIDTH / width));
        width = MAX_PHOTO_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(null);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function StepPhotos() {
  const { photos, addPhoto, removePhoto } = useGameStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      fileToBase64DataUri(file).then((url) => {
        if (url) addPhoto({ url, name: file.name });
      });
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Your Photos</h2>
        <p className="text-gray-500 mt-1">
          Add photos of friends, family, or anything you want on your game cards, board spaces, and pieces.
        </p>
      </div>

      {/* Upload area */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
          dragOver
            ? "border-violet-500 bg-violet-50"
            : "border-gray-300 hover:border-violet-300 hover:bg-violet-50/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 mb-4">
            <Upload className="h-7 w-7 text-violet-600" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drag and drop photos here
          </p>
          <p className="text-xs text-gray-400 mb-4">
            PNG, JPG, WEBP up to 10MB each
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Uploaded Photos ({photos.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="relative group"
                >
                  <Card className="overflow-hidden">
                    <div className="aspect-square relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(photo.url)}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs text-gray-500 truncate">{photo.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <Card className="border-dashed border-gray-200 bg-gray-50">
          <CardContent className="py-8 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              No photos uploaded yet. Add photos to personalize your game!
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Photos will appear on game cards, board spaces, and pieces
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
