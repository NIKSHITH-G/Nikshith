import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // a stray package-lock.json in the parent folder otherwise confuses Turbopack
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
