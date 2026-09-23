import { Routes } from "@angular/router";
import { BuyPage } from "./pages/buy/buy-page";
import { BuyCartPage } from "./pages/buy-cart/buy-cart-page";
import { BuyPayPage } from "./pages/buy-pay/buy-pay-page";
import { AuthenticatedGuard } from "@guards/authenticated.guard";
import { CartNotEmptyGuard } from "./guards/cart-not-empty.guard";

export const paymentRoutes : Routes = [
    {
        path: '',
        children: [
            {
                path : 'buy',
                component : BuyPage,
                canMatch: [ AuthenticatedGuard ],
                children: [
                    { path: '', redirectTo: 'cart', pathMatch: 'full' },
                    { path: 'cart', component: BuyCartPage },
                    { path: 'pay', component: BuyPayPage, canMatch: [ CartNotEmptyGuard ] },
                ],
            }
        ]
    }
];

export default paymentRoutes;