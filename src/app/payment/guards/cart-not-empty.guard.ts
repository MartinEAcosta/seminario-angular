import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { CartService } from '@cart/state/cart.service';

export const CartNotEmptyGuard: CanMatchFn = () => {
    const router = inject(Router);
    const cartService = inject(CartService);

    if (cartService.cart().items.size === 0) {
        router.navigateByUrl('/payment/buy/cart');
        return false;
    }
    return true;
}
