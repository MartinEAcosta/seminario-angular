# Udemix Learning

Playground personal para practicar y experimentar con distintas tecnologías del ecosistema Angular. 
- Proyecto sin fines de lucro, usado como pieza de portafolio.

## 📚 Qué es

Plataforma tipo e-commerce de cursos online. Permite:

- Explorar cursos por categoría, crear cursos propios y subir sus módulos/lecciones.
- Inscribirse (enrollment) a cursos y ver lecciones en video (video.js).
- Carrito de compras con persistencia local y checkout vía MercadoPago.
- Autenticación de usuarios (login/register).

El backend es un repo aparte (`seminario-angular-backend`); sin levantarlo, el frontend funciona igual mostrando datos mockeados para poder navegar la app.

## 🛠️ Tecnologías

- Angular 20 (standalone components)
- TypeScript
- RxJS
- SCSS
- MercadoPago SDK (checkout)
- video.js (reproducción de video lecciones)

## Commands

- `npm start` / `ng serve` — dev server (uses `environment.development.ts`)
- `npm run build` / `ng build` — production build to `dist/seminario-angular`
- `npm run watch` — dev build with `--watch`
- `npm test` / `ng test` — Karma/Jasmine unit tests (Chrome launcher)
  - Run a single spec: temporarily scope with `fdescribe`/`fit` in the spec file (Karma has no built-in `--include` file filter in this config)
- No lint script is configured in `package.json`.

Backend setup (separate repo, needed for full functionality): clone `seminario-angular-backend`, `npm install`, create `.env` from `env.template`, `npm run dev`.

<!--
## 🔎 Experiencia personal
En cuanto al Seminario lo elegí porque ya habia probado una versión anterior de Angular en su momento convencido demasiado, esto porque no habia adaptado tampoco una estructura de directorios.
Cuando me fui dando cuenta de lo facil que eran implementar una funcionalidad, y que tenia todo al alcance sin dependencias despertó mi curiosidad y adquiri un curso de Angular de Fernando Herrera, mas algunos articulos lei resulto la aplicación.
Actualmente no esta como me gustaría pero sin duda continuare con el proyecto por fuera del seminario.

Como primera medida Angular me pareció bastante tedioso debido a la cantidad de directorios/archivos que se necesitaban para crear un componente. Esto debido a que primeramente decidi empezar con *standalone components desactivados* y una estructura de directorios mas tirada a un proyecto simple, separando los directorios *componentes, servicios, etc*. A medida que iba comprendiendo los conceptos de los modulos, lazy-load y que podria hacer mis componentes mas "reactivo" a cambios, comence a intentar la migración a componentes standalone, adapte una estructura  A partir de la *Style Guide* (https://angular.dev/style-guide) de Angular en donde se aconseja ordenar los directorios por features, comence a cambiar la estrucutura, lo que me convenció debido a que era mas facil "navegar" por el codigo. A mitad de este cambio entre estructurado de directorios y entendimiento de las ventajas que me aportaban los *standalone components*, decidí buscar si habia una forma recomendada por angular, y lo encontre (https://angular.dev/reference/migrations/standalone), con un par de pasos fue migrado de forma casi automatica. Al intentar terminar de reorganizar los directorios ahora con los standalone components era muchisimo mas practico, a la hora de reorganizar los directorios no era necesario ir al modulo y cambiar manualmente la ruta del archivo, y a la hora de realizar importaciones se realizaban solo en el componente que se necesita.
Al surgirme ideas sobre lo que podria llegar a necesitar el usuario final, fui agregando funcionalidades al proyecto, entonces fue ahi donde me di cuenta en la documentación que ya estaba todo creado, las herramientas que aportaba Angular se me hicieron bastante intuitivas y con un poco de documentación se podia llegar finalizar facilmente una tarea.
Esto me parecio bastante utíl debido a que en React a la hora de implementar algo, solia ser algo más complicado decidir entre tantos otros micro-frameworks, un claro ejemplo seria el uso de *axios* en React, para el manejo de peticiones http, me paso que por mas que previamente lo habia probado, decidi utilizar HTTP Client, debido a la facilidad con la que se maneja, de igual modo me paso a la hora de implementar el *ruteo*, la practicidad de la definición de rutas importando solo el Router, sin ninguna dependencia de por medio, siento que lo hace mas usable o sin dudas tentador.
Cabe destacar la manera en la que Angular estandariza el versionado de las dependencias, siento que lo hace mas friendly a la hora de aprenderlo, debido a que lo maneja de manera automatica, lo que en React por ahi al haber tantas alternativas a elegir puede marear las versiones utilizadas.
Como conclusión final me gustó el framework debido a su rigidez, siento que da una mayor organización y proyectos mas escalables, debido por como se encuentran los arcivos en el código, en React me pasaba que al no tener por ahi esa, recomendación sobre como realizar algunas practicas como la del estilado de directorios solia preguntarme más cada paso del proyecto, quizas al haber una documentación sobre eso, hace sentir mas comodo al desarrollador y formar un buen estandar entre los mismos, a demás me pareció utíl la cantidad de herramientas que tiene, como la forma de manejar formularios, la facil que es el ruteo, y la utilización de componentes standalones. En cuanto a las señales a la hora de intentar implementarlas en mi servicio Cart, para el que le habia dado una estructura de Map<string,CartItem> al principio me resultaba confuso cuando estaba cambiando la señal y cuando el map en si, pero mas allá de eso me gusto la forma en la que se manejan los refrescos, al tener una experiencia previa de base en React, me fue de gran ayuda a la hora de dar los primeros pasos en Angular, debido a que hay conceptos que son casi practicamente lo mismo, como el caso del *effect( ( ) => )*.

## Udemix
|La idea de esta sección es comentar un poco lo que tengo pensado realizar en este proyecto y como se encuentra desarrollado..|

Actualmente el back-end no es de lo mejor, de hecho es bastante basico, por lo tanto no he decido desplegarlo. En su versión sin el back levantado se pierden algunas funcionalidades que me hubiera gustado que esten, pero por un tema de subida de imagenes/videos que hasta el momento no he podido lograr, se encuentra preparada con datos previamente mockeados, esto por un motivo meramente estetico, la página en si seria "funcional" dentro de todo pero a la hora de crear un curso, se crearia sin una imagen. Por lo tanto funcionalidades como la de login/register, la course-page entre otras no son capaces de funcionar.
Sin embargo puede ser chequeado el proyecto siguiendo los siguientes pasos:
- Una vez clonado el repositorio (https://github.com/MartinEAcosta/seminario-angular-backend) se ejecuta el comando npm install.
- Crear el archivo .env con las variables indicadas en env.template
- npm run dev.

## Funcionamiento de HttpClient

A la hora de realizar una petición se pueden utilizar diferentes tipos de "middlewares" para tomar acciones segun las
diferentes respuestas.

En el caso de que la petición se halla realizado de forma correcta (2xx status), el metodo tap:
Permite "interceptar" y realizar acciones, esto es util para gestionar estado.
tap( resp => {
    this._user.set(resp.user);
});

En caso de que se detecte un error a través del metodo:
catchError(error : any) => {
    // Logica de resolución de error.
}

El uso de rxResource fue visto en un curso aparte de Fernando Herrera, y lo utilicé para una vez que se carguen los cursos obtenerlos. Es como una especie de observable reactivo que permite mantener actualizado el valor de señales o algun computed.

## Los INTERCEPTORS

Son un middleware representados simplemente como una funcion, estos pueden ser utilizados por interceptar peticiones http o se pueden especificar a un path en concreto.

Lo que antes en React lo hacia consumiendo el status del store aca lo hago a través del interceptor,
permitiendo o no el acceso a la ruta
-->
