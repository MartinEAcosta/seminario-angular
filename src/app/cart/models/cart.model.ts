import { Course } from "@interfaces/course.interfaces";
import { CartItem } from "./cart.interface";


export class Cart {

    public items : Map<string, CartItem> = new Map<string,CartItem>();
    public code ?: string;

    constructor( items : Map<string,CartItem> = new Map<string,CartItem>() , code ?: string ) {
        items.forEach( item => this.items.set( item.course.id , item ) );
    }

    public addToCart = ( course : Course )  => {

        if( course.capacity != undefined && course.capacity <= 0 ) return;

        // En caso de que ya tenga en mi carrito una cantidad del curso, tomo la cantidad reservada
        // o si no la tengo 0 y posteriormente se le sumara 1 
        this.items.get( course.id )?.quantity || 0;
        
        this.upQuantity( course );

        return this.items;
    }

    public upQuantity = ( course : Course ) : Map<string,CartItem> => {
        
        if( this.items.get( course.id )?.course.capacity === undefined || this.items.get( course.id )?.quantity! < this.items.get( course.id )!.course.capacity! ){
            this.items.set( course.id , 
                        {
                            course: course ,
                            quantity: !this.items.get(course.id) ? 1 : +this.items.get(course.id)?.quantity! +1 
                        } 
                      );
        }
        return this.items;
    }

    public downQuantity = ( course : Course ) : Map<string,CartItem> => {
        if( this.items.get(course.id)!.quantity > 1  ){
            this.items.set( course.id , 
                {
                    course: course ,
                    quantity: +this.items.get( course.id )?.quantity! -1 
                } 
            );
        }
        else{
            this.items.delete( course.id );
        }
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