#!/usr/bin/env node

/**
 * Script para generar favicon.ico desde el logo PNG
 * Requiere: npm install sharp
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const logoPath = path.join(__dirname, "../public/images/feni-logo.png");
const faviconPath = path.join(__dirname, "../public/favicon.ico");

async function generateFavicon() {
  try {
    console.log("🎨 Generando favicon.ico desde", logoPath);

    // Redimensionar a 32x32 (tamaño estándar para favicon)
    await sharp(logoPath)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(faviconPath);

    console.log("✅ Favicon creado exitosamente en:", faviconPath);
    console.log("📊 Tamaño del archivo:", fs.statSync(faviconPath).size, "bytes");
  } catch (error) {
    console.error("❌ Error generando favicon:", error.message);
    process.exit(1);
  }
}

generateFavicon();
