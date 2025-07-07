# Seminario 🅰️ngular

## 🔎 Experiencia personal
Como primera medida Angular me pareció bastante tedioso debido a la cantidad de directorios/archivos que se necesitaban para crear un componente. Esto debido a que primeramente decidi empezar con *standalone components desactivados* y una estructura de directorios mas tirada a un proyecto simple, separando los directorios *componentes, servicios, etc*. A medida que iba comprendiendo los conceptos de los modulos, lazy-load y que podria hacer mis componentes mas "reactivo" a cambios, comence a intentar la migración a componentes standalone, adapte una estructura  A partir de la *Style Guide* (https://angular.dev/style-guide) de Angular en donde se aconseja ordenar los directorios por features, comence a cambiar la estrucutura, lo que me convenció debido a que era mas facil "navegar" por el codigo. A mitad de este cambio entre estructurado de directorios y entendimiento de las ventajas que me aportaban los *standalone components*, decidí buscar si habia una forma recomendada por angular, y lo encontre (https://angular.dev/reference/migrations/standalone), con un par de pasos fue migrado de forma casi automatica. Al intentar terminar de reorganizar los directorios ahora con los standalone components era muchisimo mas practico, a la hora de reorganizar los directorios no era necesario ir al modulo y cambiar manualmente la ruta del archivo, y a la hora de realizar importaciones se realizaban solo en el componente que se necesita.  
Al surgirme ideas sobre lo que podria llegar a necesitar el usuario final, fui agregando funcionalidades al proyecto, entonces fue ahi donde me di cuenta en la documentación que ya estaba todo creado, las herramientas que aportaba Angular se me hicieron bastante intuitivas y con un poco de documentación se podia llegar finalizar facilmente una tarea.  
Esto me parecio bastante utíl debido a que en React a la hora de implementar algo, solia ser algo más complicado decidir entre tantos otros micro-frameworks, un claro ejemplo seria el uso de *axios* en React, para el manejo de peticiones http, me paso que por mas que previamente lo habia probado, decidi utilizar HTTP Client, debido a la facilidad con la que se maneja, de igual modo me paso a la hora de implementar el *ruteo*, la practicidad de la definición de rutas importando solo el Router, sin ninguna dependencia de por medio, siento que lo hace mas usable o sin dudas tentador.  
Cabe destacar la manera en la que Angular estandariza el versionado de las dependencias, siento que lo hace mas friendly a la hora de aprenderlo, debido a que lo maneja de manera automatica, lo que en React por ahi al haber tantas alternativas a elegir puede marear las versiones utilizadas.  
Como conclusión final me gustó el framework debido a su rigidez, siento que da una mayor organización y proyectos mas escalables, debido por como se encuentran los arcivos en el código, en React me pasaba que al no tener por ahi esa, recomendación sobre como realizar algunas practicas como la del estilado de directorios solia preguntarme más cada paso del proyecto, quizas al haber una documentación sobre eso, hace sentir mas comodo al desarrollador y formar un buen estandar entre los mismos, a demás me pareció utíl la cantidad de herramientas que tiene, como la forma de manejar formularios, la facil que es el ruteo, y la utilización de componentes standalones. En cuanto a las señales a la hora de intentar implementarlas en mi servicio Cart, para el que le habia dado una estructura de Map<string,CartItem> al principio me resultaba confuso cuando estaba cambiando la señal y cuando el map en si, pero mas allá de eso me gusto la forma en la que se manejan los refrescos, al tener una experiencia previa de base en React, me fue de gran ayuda a la hora de dar los primeros pasos en Angular, debido a que hay conceptos que son casi practicamente lo mismo, como el caso del *effect( ( ) => )*.

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