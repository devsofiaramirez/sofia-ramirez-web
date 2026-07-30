-- El modal publicitario ahora puede llevar un video en vez de (o además de) una imagen.
INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('promo_modal_video_url', '');
