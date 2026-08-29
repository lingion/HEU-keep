<p align="center">
  <a href="https://github.com/lingion/HEU-keep/stargazers"><img src="https://img.shields.io/github/stars/lingion/HEU-keep?style=for-the-badge&logo=github&color=FFD700" alt="Stars"></a>
  <a href="https://github.com/lingion/HEU-keep/network/members"><img src="https://img.shields.io/github/forks/lingion/HEU-keep?style=for-the-badge&logo=github&color=8B5CF6" alt="Forks"></a>
  <a href="https://github.com/lingion/HEU-keep/issues"><img src="https://img.shields.io/github/issues/lingion/HEU-keep?style=for-the-badge&logo=github&color=EF4444" alt="Issues"></a>
  <a href="https://github.com/lingion/HEU-keep/blob/main/LICENSE"><img src="https://img.shields.io/github/license/lingion/HEU-keep?style=for-the-badge&logo=github&color=10B981" alt="License"></a>
  <br>
  <a href="https://github.com/lingion/HEU-keep/commits/main"><img src="https://img.shields.io/github/last-commit/lingion/HEU-keep?style=flat-square" alt="Last commit"></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-2.x-000000?style=flat-square&logo=flask" alt="Flask"></a>
</p>

HEU-keep is a **Keep-style workout card generator** adapted for Harbin Engineering University (HEU).

> **Primary repository:** `lingion/HEU-keep`  
> This is the only mainline source of truth for the project.

## Try Demo (P1)

- **Cloudflare Pages (latest deployment):**  
  https://master.heu-keep-demo.pages.dev
- **Direct deployment URL:**  
  https://36974885.heu-keep-demo.pages.dev
- Entry pages:
  - `/index.html` (classic)
  - `/liquid.html` (liquid)

## Screenshots (P0)

### Light Mode
![HEU-keep Classic Preview](https://raw.githubusercontent.com/lingion/HEU-keep/master/docs/screenshots/preview-light-mode.jpg)

### Dark Mode
![HEU-keep Liquid Preview](https://raw.githubusercontent.com/lingion/HEU-keep/master/docs/screenshots/preview-dark-mode.jpg)

## Highlights

- High-fidelity Keep-style running summary UI
- HEU map adaptation and scene customization
- Real-time data editing + preview
- Manual and generated running tracks
- High-resolution export pipeline
- IndexedDB local persistence

## Collaboration Split

### Kerry1020
- frontend optimization
- UI polish and interaction refinement
- mobile adaptation and testing

### Lingion
- backend logic and API integration
- deployment and delivery
- full-project integration and packaging

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Canvas, IndexedDB, html2canvas
- Backend: Python, Flask, Flask-CORS, NumPy
- Deployment: Cloudflare Pages (frontend demo), static hosting

## Repository Rule

All meaningful project evolution should ultimately land in this repository. Collaboration copies or presentation mirrors should not replace this repo as the mainline.

## Docs

- `ARCHITECTURE.md` — architecture and module responsibilities
- `DEPLOYMENT.md` — local run + deployment notes
- `RESUME_BULLETS.md` — resume-ready project descriptions
- `TEAM_SPLIT.md` — role split
- `MAIN_REPOSITORY_SCOPE.md` — main repository rule
- **[Online Operation Guide](https://blog.qdp.qzz.io/docs/heu-keep/overview)** — step-by-step user manual with workflow, track generation, export, and troubleshooting
- **[Technical Write-up](https://blog.qdp.qzz.io/heu-keep-workout-card-generator)** — elliptical track decomposition, random walk drift, color gradient state machine, off-screen export pipeline

## License

[GPL-3.0](LICENSE)
