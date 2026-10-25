---
layout: default
title: Publications
permalink: /publications/
---
<div class="page-container">
  <div class="page-label">Research</div>
  <h1 class="page-title">Publications</h1>

  {% assign topics = '' | split: '' %}
  {% for p in site.data.publications %}
    {% for t in p.tags %}
      {% assign topics = topics | push: t %}
    {% endfor %}
  {% endfor %}
  {% assign topics = topics | uniq | sort %}

  {% if topics != empty %}
  <div class="filter-bar">
    <button class="filter-pill active" data-tag="all">All</button>
    {% for t in topics %}
    <button class="filter-pill" data-tag="{{ t }}">{{ t }}</button>
    {% endfor %}
  </div>
  {% endif %}

  {% assign pubs = site.data.publications %}
  {% assign manuscripts = pubs | where: "venue", "Preprint" %}
  {% assign published = pubs | where_exp: "p", "p.venue != 'Preprint'" %}

  {% if manuscripts != empty %}
  <section class="pub-year-section">
    <h2 class="pub-year">Manuscript</h2>
    {% for p in manuscripts %}
    {% include pub-card.html pub=p %}
    {% endfor %}
  </section>
  {% endif %}

  {% assign years = '' | split: '' %}
  {% for p in published %}
    {% assign years = years | push: p.year %}
  {% endfor %}
  {% assign years = years | uniq | sort | reverse %}

  {% for y in years %}
  <section class="pub-year-section">
    <h2 class="pub-year">{{ y }}</h2>
    {% assign year_pubs = published | where: "year", y %}
    {% for p in year_pubs %}
    {% include pub-card.html pub=p %}
    {% endfor %}
  </section>
  {% endfor %}
</div>
<script src="{{ '/assets/js/publications.js' | relative_url }}"></script>
