# ---- builder ----
FROM node:24-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack (shipped with Node 24)
RUN corepack enable

# Install deps first (cached layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
COPY . .
RUN pnpm build

# ---- runner ----
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
