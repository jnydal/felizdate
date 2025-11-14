# FelizDate 💘 

FelizDate is a real-time, full-stack dating platform built as a personal project to explore performance, scalability, and responsive UI design.
It features instant messaging, geolocation, and a single-page JavaScript interface optimized for both desktop and mobile. The platform was built between 2011-2013 and now sports a modern **React + TypeScript** frontend (migrated from the original MooTools/jQuery MVC) that mirrors the original data contracts while embracing hooks and Redux Toolkit.

---

## Key Features

- **Real-time chat** with WebSocket integration (like Facebook Messenger)
- **Modern TypeScript client** (React 18 + Redux Toolkit + RTK Query) for ultra-fast UI updates
- **Responsive design** one unified codebase for desktop, tablet, and mobile
- **Cloud optimized** using Amazon S3 & CloudFront for static and media delivery
- **User-friendly profile dialogs** and multi-conversation support in a single browser tab
- **Geospatial support** (location-based matching)
- **Internationalization (i18n)** and multilingual interface
- **Facebook registration** for quick onboarding
- **JSON-based API** for lightweight client-server communication
- **Server stack ready for horizontal scaling**
- **Containerized dev/prod parity** via Dockerfile + `docker-compose` (PostGIS-backed services out of the box)

---

## System Architecture

### Client-Side
- **React 18 + TypeScript + Vite** SPA with Redux Toolkit for global state and RTK Query for all `/action/*` APIs  
- Legacy MooTools MVC concepts reimplemented as typed slices: session, messaging, search, geolocation, media, and options  
- WebSocket hook (`useRealtimeMessages`) mirrors the classic `ServerHandler` push channel for live conversations  
- Responsive layout components (`TopNav`, `Sidebar`, routed pages) recreate the original UX while enabling modern design systems  
- ESLint/Prettier, alias-based imports (`@/...`), and environment-driven Vite proxy keep the codebase maintainable and deployable across environments  

**Advantages:**
- Same backend contract with a future-proof frontend stack
- Hot-reload DX, testable hooks, and strongly typed data models
- Easier onboarding for modern JavaScript/TypeScript teams

---

### Server-Side
- **Frameworks:** Tornado (WebSocket handling) + Django (HTTP/Wsgi + ORM)  
- **Database:** PostgreSQL 8.4 with PostGIS 2.0 for geolocation  
- **Caching:** Memcached + pgBouncer connection pooling  
- **Web Server:** Nginx + HAProxy for load balancing  
- **App Servers:** Gunicorn (9 workers) for main app, plus dedicated chat worker  
- **CDN & Storage:** Amazon S3 + CloudFront  

**Server endpoints (simplified):**
```text
Login(…)
Logout(…)
setStatus(…)
getUserSession(…)
setPosition(…)
getProfile(…)
sendMessage(…)
...
```

**Django Models include:**
`UserProfile`, `Message`, `Media`, `Interest`, `Membership`, `PendingProfileImages`, `Worker`, `City`, `Occupation`, `Religion`, etc.

---

## Setup Overview

Typical production setup includes:

| Component | Version | Purpose |
|------------|----------|----------|
| PostgreSQL | 8.4 | Primary database |
| PostGIS | 16.3.4 | Geolocation data |
| Memcached | — | Caching layer |
| pgBouncer | — | Connection pooling |
| Tornado | 6.4.1 | WebSocket handling |
| Django | 5.1.2 | Web framework & ORM |
| Gunicorn | 21.2.0 | Application server |
| HAProxy | 1.4 | Load balancing |
| Nginx | — | Static proxy / reverse proxy |
| Amazon S3 & CloudFront | — | CDN & media hosting |

---

## Deployment

1. Clone repository:
   ```bash
   git clone https://github.com/<your-username>/felizdate.git
   cd felizdate
   ```
2. Install dependencies and virtual environment
3. Configure database and AWS credentials
4. Start backend services (Postgres, Memcached, pgBouncer)
5. Run Django + Tornado servers behind Nginx/HAProxy
6. Access the app via `http://localhost` or your domain

### Containerized workflow

For a turnkey local stack you can use the bundled Docker assets:

```bash
docker compose up --build
```

This starts:

- `web`: the Django + Tornado hybrid app served by Gunicorn (`http://localhost:8000`)
- `db`: PostgreSQL + PostGIS (user/db/password all default to `felizdate`)

Environment variables such as `PGHOST`, `MEDIA_ROOT`, and `MEDIA_URL` are wired through `docker-compose.yml`, so you can override them via a `.env` file or CLI flags as needed.

Useful helpers:

```bash
# Run Django migrations inside the container
docker compose run --rm web python manage.py migrate

# Create an admin user
docker compose run --rm web python manage.py createsuperuser
```

---

## Design Philosophy

FelizDate is engineered for:
- **Speed**: lightweight client and async communication
- **Scalability**: horizontally scalable microservice-inspired stack
- **Simplicity**: JSON-only API and modular architecture
- **User Experience**: optimized for human interaction and minimal friction

---

## Screenshots / Demo

You can preview the platform here:  
 [http://www.felizdate.com](http://www.felizdate.com)   (update: not available anymore)
 [http://www.felizdate.no](http://www.felizdate.no)   (update: not available anymore)

*(Add screenshots or GIFs such as `felizdate_setup.gif` here.)*

---

## Author

**Thor Jørund Nydal**  
[jnydal@gmail.com](mailto:jnydal@gmail.com)  
[LinkedIn](http://www.linkedin.com/pub/j%C3%B8rund-nydal/10/485/39a)

---

## License

This project is currently proprietary but may be offered for acquisition or licensing.  
Please contact the author for details.

---

## Notes

> FelizDate has been developed independently over nearly two years.  
> The platform is functional, scalable, and ready for commercial adaptation or sale.
