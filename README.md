# SeminarioAngular

Primeramente adapte una estructura mas tirada a lo que suelo hacer en React, separando con una carpeta componentes a partir de la es Style Guide de angular que aconseja ordenar por features, cambie la estructura.

https://angular.dev/style-guide

## Funcionamiento de HttpClient

A la hora de realizar una petición se pueden utilizar diferentes tipos de "middlewares" para tomar acciones segun las 
diferentes respuestas.

En el caso de que la petición se halla realizado de forma correcta (2xx status), el metodo tap: 
Permite "interceptar" y realizar acciones, esto es util para gestionar estado.
tap( resp => {
    this._user.set(resp.user);
});




