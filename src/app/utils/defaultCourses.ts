import { Course } from "@course/models/course.interfaces";

// Catálogo de respaldo para cuando el backend no está levantado (ver PRODUCT.md).
// Las miniaturas son ilustraciones propias en `public/assets/course-thumb-*.svg`:
// el modo demo tiene que leerse como una decisión, no como arte de terceros.
export const defaultCourses : Course[] = [
  {
    "id": "a",
    "title": "Introducción a JavaScript",
    "description": "Aprendé los fundamentos de JavaScript desde cero, incluyendo variables, funciones y estructuras de control.",
    "id_category": "Legacy",
    "category_name": "Legacy",
    "thumbnail_url": "/assets/course-thumb-javascript.svg",
    "id_file": "a",
    "id_owner": "665fa63c94c4f85d3f9e73a1",
    "price": 2499,
    "capacity": 100,
    "owner_name": null,
    "owner_avatar_url": null,
    "owner_bio": null,
    "spots_remaining": null
  },
  {
    "id": "b",
    "title": "Angular desde Cero",
    "description": "Dominá el framework Angular creando componentes, servicios y rutas.",
    "id_category": "Framework",
    "category_name": "Framework",
    "thumbnail_url": "/assets/course-thumb-angular.svg",
    "id_file": "a",
    "id_owner": "665fa63c94c4f85d3f9e73a1",
    "price": 2999,
    "capacity": 80,
    "owner_name": null,
    "owner_avatar_url": null,
    "owner_bio": null,
    "spots_remaining": null
  },
  {
    "id": "c",
    "title": "Curso Fullstack con MERN",
    "description": "Construí una aplicación completa utilizando MongoDB, Express, React y Node.js.",
    "id_category": "Framework",
    "category_name": "Framework",
    "thumbnail_url": "/assets/course-thumb-fullstack.svg",
    "id_file": "a",
    "id_owner": "665fa63c94c4f85d3f9e73a1",
    "price": 3999,
    "capacity": 50,
    "owner_name": null,
    "owner_avatar_url": null,
    "owner_bio": null,
    "spots_remaining": null
  },
  {
    "id": "d",
    "title": "SQL y Bases de Datos Relacionales",
    "description": "Aprendé a diseñar y consultar bases de datos con PostgreSQL y MySQL.",
    "id_category": "Bases de datos",
    "category_name": "Bases de datos",
    "thumbnail_url": "/assets/course-thumb-sql.svg",
    "id_file": "a",
    "id_owner": "665fa63c94c4f85d3f9e73a1",
    "price": 1999,
    "owner_name": null,
    "owner_avatar_url": null,
    "owner_bio": null,
    "spots_remaining": null
  },
  {
    "id": "e",
    "title": "Git y GitHub para Desarrolladores",
    "description": "Controlá versiones como un profesional usando Git y GitHub en tus proyectos.",
    "id_category": "Gestionado de versiones",
    "category_name": "Gestionado de versiones",
    "thumbnail_url": "/assets/course-thumb-git.svg",
    "id_file": "a",
    "id_owner": "665fa63c94c4f85d3f9e73a1",
    "price": 1499,
    "capacity": 200,
    "owner_name": null,
    "owner_avatar_url": null,
    "owner_bio": null,
    "spots_remaining": null
  }
]
