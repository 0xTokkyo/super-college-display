-- ═══════════════════════════════════════════════════════════════
-- Super College Display — Setup SQL
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ═══════════════════════════════════════════════════════════════

-- 1. Type ENUM pour les types de page
CREATE TYPE page_type AS ENUM ('prof_absence', 'show_document');

-- 2. Table principale
CREATE TABLE display_pages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              page_type NOT NULL,
  title             text NOT NULL DEFAULT '',
  "order"           integer NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  duration_seconds  integer NOT NULL DEFAULT 20,
  content           jsonb NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 3. Index sur order pour les requêtes triées
CREATE INDEX display_pages_order_idx ON display_pages ("order");

-- 4. Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER display_pages_updated_at
  BEFORE UPDATE ON display_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Row Level Security (RLS)
ALTER TABLE display_pages ENABLE ROW LEVEL SECURITY;

-- Lecture publique (écran TV sans authentification)
CREATE POLICY "Public read active pages"
  ON display_pages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Écriture uniquement pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert"
  ON display_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update"
  ON display_pages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete"
  ON display_pages
  FOR DELETE
  TO authenticated
  USING (true);

-- 6. Activer Realtime sur la table
ALTER PUBLICATION supabase_realtime ADD TABLE display_pages;

-- ═══════════════════════════════════════════════════════════════
-- Storage bucket pour les fichiers (images, PDFs, vidéos)
-- À exécuter APRÈS avoir créé le bucket "display-documents"
-- dans l'interface Supabase Storage (onglet Storage > New bucket)
-- ═══════════════════════════════════════════════════════════════

-- Politique lecture publique sur le storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('display-documents', 'display-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read display-documents"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'display-documents');

CREATE POLICY "Authenticated upload display-documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'display-documents');

CREATE POLICY "Authenticated delete display-documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'display-documents');
