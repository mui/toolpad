#!/usr/bin/env bash

# Ref: https://community.render.com/t/gatsby-build-caching-and-image-transformations/129/2

restore_render_cache() {
  local source_cache_dir="$1"
  if [[ -d "$XDG_CACHE_HOME/$source_cache_dir" ]]; then
    echo "CACHE HIT $source_cache_dir, rsyncing..."
    rsync -a "$XDG_CACHE_HOME/$source_cache_dir/" $source_cache_dir
  else
    echo "CACHE MISS $source_cache_dir"
  fi
}

save_render_cache() {
  local source_cache_dir="$1"
  echo "CACHE SAVE $source_cache_dir, rsyncing..."
  mkdir -p "$XDG_CACHE_HOME/$source_cache_dir"
  rsync -a $source_cache_dir/ "$XDG_CACHE_HOME/$source_cache_dir"
}

install_and_build_with_cache() {
  local next_cache_dir="packages/toolpad-app/.next"
  local yarn_cache_dir=".yarn-cache"
  mdir -p yarn_cache_dir

  yarn config set cache-folder yarn_cache_dir

  restore_render_cache "$yarn_cache_dir"
  restore_render_cache "$next_cache_dir"

  yarn --frozen-lockfile --prod=false
  yarn release:build

  save_render_cache "$yarn_cache_dir"
  save_render_cache "$next_cache_dir"
}

install_and_build_with_cache

