import { Course } from "@interfaces/course.interfaces";
import { CartItem } from "./cart.interface";


export class Cart {

    public items : Map<string, CartItem> = new Map<string,CartItem>();
    public code ?: string;

    constructor( items : Map<string,CartItem> = new Map<string,CartItem>() , code ?: string ) {
        items.forEach( item => this.items.set( item.course.id , item ) );
        this.code = code;
    }

    public addToCart = ( course : Course ) : Map<string,CartItem> => {

        if( course.capacity != undefined && course.capacity <= 0 ) return this.items;

        if( !this.items.has( course.id ) ){
            this.items.set( course.id , { course , quantity: 1 } );
        }

        return this.items;
    }

    public removeItem = ( course : Course ) : Map<string,CartItem> => {
        this.items.delete( course.id );
        return this.items;
    }

    public calculateTotal = ( ) => {
        let total = 0;
        for (const item of this.items.values()) {
            total += (item.course.price * item.quantity);
        }
        // * En caso de haber cupón de descuento verificar con el back-end
        return total;
    }

}