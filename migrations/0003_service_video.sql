-- Cada servicio/curso puede llevar, además de la foto, un video propio (ej. testimonio del curso,
-- recorrido de la bodega). Se sube a R2 igual que la foto, vía el mismo FileUploader.
ALTER TABLE services ADD COLUMN video_url TEXT;
