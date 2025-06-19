# SeminarioAngular

## Experiencia personal
Primeramente adapte una estructura mas tirada a lo que suelo hacer en React, separando con una carpeta componentes, servicios, hooks, etc .A partir de la es Style Guide (https://angular.dev/style-guide) de Angular en donde se aconseja ordenar por features, cambie la estructura.  
Como primera impresión no me gusto la rigidez que aportaba Angular dentro de la estructuración de proyectos pero luego de un tiempo me termino convenciendo, esto debido a la facilidad en la que se "navega" por el código. Luego al querer ir agregando funcionalidades al proyecto me fui dando cuenta en la docu que ya estaba todo creado, las herramientas que aportaba Angular se me hicieron bastante intuitivas y con un poco de documentación se podia llegar finalizar facilmente una tarea, a diferencia de lo que pasaba con React, al ser tan solo una libreria daba el poder al usuario de como resolver la tarea, teniendo diferentes opciones para solucionar un problema por ejemplo las peticiones http podrían ser manejadas con axios, en el caso de Angular al aportarte ellos mismos un estandar, que tras eso funciona correctamente me parecio genial.


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

<!-- Lo que antes en React lo hacia consumiendo el status del store aca lo hago a través del interceptor, 
permitiendo o no el acceso a la ruta  -->