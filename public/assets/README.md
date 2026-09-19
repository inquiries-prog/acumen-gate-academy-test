# Where do the images go?

**Not here.** Images belong in Supabase Storage, uploaded through the admin
panel, so the client can change any photo on the site without a developer or a
redeploy (SRS §9.3).

## Uploading a few images

Use the admin panel. Every image field has a preview and a Replace button:

- Logo → **Banner, hero & contact details**
- Mentor photos → **Mentors**
- Course card photos → **Our Courses cards**
- Student result photos → **Results page**
- Testimonial photos → **Success stories**

## Uploading many images

For the ~84 result images and the newspaper clipping pages, use the importer
instead of clicking through the panel 84 times:

```bash
node scripts/import-images.mjs --dir ./incoming/results --kind result
node scripts/import-images.mjs --dir ./incoming/press   --kind press --news-strip
```

See [docs/SETUP.md](../../docs/SETUP.md) §3.

---

The empty folders beside this file are only a staging area if you want one —
nothing in `public/assets/` is referenced by the site.
