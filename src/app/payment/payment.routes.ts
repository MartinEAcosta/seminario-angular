import { Routes } from "@angular/router";
import { BuyPage } from "./pages/buy/buy-page";
import { BuyPayPage } from "./pages/buy-pay/buy-pay-page";
import { BuyConfirmationPage } from "./pages/buy-confirmation/buy-confirmation-page";
import { AuthenticatedGuard } from "@guards/authenticated.guard";

export const paymentRoutes : Routes = [
    {
        path: '',
        children: [
            {
                path : 'buy',
                component : BuyPage,
                canMatch: [ AuthenticatedGuard ],
                children: [
                    { path: '', redirectTo: 'pay', pathMatch: 'full' },
                    { path: 'pay', component: BuyPayPage },
                    { path: 'confirmation', component: BuyConfirmationPage },
                ],
            }
        ]
    }
];

export default paymentRoutes;
