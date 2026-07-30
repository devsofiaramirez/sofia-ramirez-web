INSERT INTO site_settings (key, value)
VALUES ('hero_avatar_url', '/images/hero/sofia-hero.jpg')
ON CONFLICT(key) DO NOTHING;
