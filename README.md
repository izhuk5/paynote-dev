# Deploy Guide — jsDelivr + GitHub

## 1. Форматы URL / URL Formats

```
// По тегу (стабильно, кэшируется навсегда / stable, cached forever):
https://cdn.jsdelivr.net/gh/USERNAME/REPO@1.0.0/dist/app.min.js

// По latest (обновляется, но кэш до 24ч / updates, but cache up to 24h):
https://cdn.jsdelivr.net/gh/USERNAME/REPO@latest/dist/app.min.js

// По конкретному commit hash (абсолютно стабильно / absolutely stable):
https://cdn.jsdelivr.net/gh/USERNAME/REPO@a1b2c3d/dist/app.min.js
```

> **RU:** Для продакшена всегда используй `@тег`, не `@latest` — иначе случайный баг в коде может сломать живой сайт.
>
> **EN:** For production always use `@tag`, not `@latest` — otherwise a random bug can break the live site instantly.

---

## 2. Рабочий флоу / Workflow

```bash
# 1. RU: Пишешь код в sections/ или utils/
#    EN: Write code in sections/ or utils/

# 2. RU: Минифицируешь
#    EN: Minify
npm run build          # src/app.js → dist/app.min.js
npm run build:all      # все .js из sections/ и utils/ → dist/

# 3. RU: Коммитишь вместе с dist/
#    EN: Commit together with dist/
git add .
git commit -m "feat: section name"
git push

# 4. RU: Создаёшь тег для релиза
#    EN: Create a release tag
git tag v1.2.0
git push origin v1.2.0

# 5. RU: В Webflow вставляешь:
#    EN: Paste into Webflow:
# https://cdn.jsdelivr.net/gh/USERNAME/REPO@v1.2.0/dist/app.min.js
```

---

## 3. Отдельные файлы на секцию / Per-section Files

**RU:** Для секций лучше хранить раздельно и подключать в Webflow отдельными `<script>` тегами — не бандлить всё в один `app.min.js`.

**EN:** For sections it's better to keep files separate and load them in Webflow as individual `<script>` tags — don't bundle everything into one `app.min.js`.

```
https://cdn.jsdelivr.net/gh/USERNAME/REPO@v1.0.0/dist/sections/sectionHero.min.js
https://cdn.jsdelivr.net/gh/USERNAME/REPO@v1.0.0/dist/utils/form.min.js
```

---

## 4. Инвалидация кэша / Cache Invalidation

**RU:** Если нужно срочно обновить файл без смены тега:

**EN:** If you need to force-update a file without changing the tag:

```
https://purge.jsdelivr.net/gh/USERNAME/REPO@latest/dist/app.min.js
```

---

## 5. Важно / Important

| | RU | EN |
|---|---|---|
| **Репозиторий** | Должен быть **публичным** | Must be **public** |
| **dist/** | Не в `.gitignore` — намеренно | Not in `.gitignore` — intentional |
| **Тег vs latest** | Тег для продакшена | Tag for production |
