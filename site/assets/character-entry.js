'use strict';
{
  const slug = new URLSearchParams(location.search).get('card');
  const character = bySlug.get(slug);
  if (character) {
    document.title = `${character.name} · ${document.title}`;
    openDetail(character.slug);
  }
}
