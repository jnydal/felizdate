# FelizDate 💘

**FelizDate** is a real-time, full-stack dating platform built for performance, scalability, and responsive user experience.  
It was developed as a personal project with the ambition to compete with mainstream dating services — featuring instant messaging, geolocation, and a smooth single-page JavaScript interface optimized for both desktop and mobile.

---

## 🌟 Key Features

- 💬 **Real-time chat** with WebSocket integration (like Facebook Messenger)
- ⚡ **100% JavaScript-based client** for ultra-fast UI updates
- 📱 **Responsive design** – one unified codebase for desktop, tablet, and mobile
- ☁️ **Cloud optimized** using Amazon S3 & CloudFront for static and media delivery
- 👤 **User-friendly profile dialogs** and multi-conversation support in a single browser tab
- 🗺️ **Geospatial support** (location-based matching)
- 🌍 **Internationalization (i18n)** and multilingual interface
- 🔐 **Facebook registration** for quick onboarding
- 💡 **JSON-based API** for lightweight client-server communication
- 🧱 **Server stack ready for horizontal scaling**

---

## 🏗️ System Architecture

### Client-Side
- Built using **MooTools** and **jQuery** for DOM handling  
- Designed as a **single-page app** running on **Apache Cordova** for mobile integration  
- Handles:
  - `performAction(request)`  
  - `handleSuccessResponse(response)`  
  - `handleErrorResponse(response)`  
  - `handlePushResponse(response)`  
- Follows an **MVC-like pattern**:
  - **Controller** – business logic & request handling  
  - **ObservableModel** – event-based state updates  
  - **View** – dynamic rendering, dialogs, menus, and profile views  

**Advantages:**
- One client codebase across all devices
- Minimal cross-browser issues
- Easier maintenance and faster innovation cycles

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

## ⚙️ Setup Overview

Typical production setup includes:

| Component | Version | Purpose |
|------------|----------|----------|
| PostgreSQL | 8.4 | Primary database |
| PostGIS | 2.0 | Geolocation data |
| Memcached | — | Caching layer |
| pgBouncer | — | Connection pooling |
| Tornado | 2.4 | WebSocket handling |
| Django | 1.4 | Web framework & ORM |
| Gunicorn | — | Application server |
| HAProxy | 1.4 | Load balancing |
| Nginx | — | Static proxy / reverse proxy |
| Amazon S3 & CloudFront | — | CDN & media hosting |

---

## 🚀 Deployment

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

---

## 🧩 Design Philosophy

FelizDate is engineered for:
- **Speed** – lightweight client and async communication
- **Scalability** – horizontally scalable microservice-inspired stack
- **Simplicity** – JSON-only API and modular architecture
- **User Experience** – optimized for human interaction and minimal friction

---

## 📸 Screenshots / Demo

You can preview the platform here:  
👉 [http://www.felizdate.com](http://www.felizdate.com)  
👉 [http://www.felizdate.no](http://www.felizdate.no)

*(Add screenshots or GIFs such as `felizdate_setup.gif` here.)*

---

## 👤 Author

**Jørund Nydal**  
📧 [jnydal@gmail.com](mailto:jnydal@gmail.com)  
🔗 [LinkedIn](http://www.linkedin.com/pub/j%C3%B8rund-nydal/10/485/39a)

---

## 🪪 License

This project is currently proprietary but may be offered for acquisition or licensing.  
Please contact the author for details.

---

## 💬 Notes

> FelizDate has been developed independently over nearly two years.  
> The platform is functional, scalable, and ready for commercial adaptation or sale.
