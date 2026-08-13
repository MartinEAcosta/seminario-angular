---
description: Crea git worktree aislado en .trees/ y ejecuta ahi las instrucciones dadas
argument-hint: [instrucciones del requerimiento]
---

Requerimiento recibido:

$ARGUMENTS

Pasos, en orden:

1. Deriva un nombre corto kebab-case (2-4 palabras) que resuma el requerimiento arriba. Usalo como `<nombre>`.
2. Desde raiz del repo, corre: `git worktree add .trees/<nombre> -b <nombre>`
   - Si branch `<nombre>` ya existe, usa `git worktree add .trees/<nombre> <nombre>` (sin `-b`).
   - Si falla porque `.trees/<nombre>` ya existe, agrega sufijo numerico (`<nombre>-2`, etc).
3. A partir de aqui, trabaja EXCLUSIVAMENTE dentro de `.trees/<nombre>` (usa rutas absolutas ahi o `cd` antes de cada comando de Bash/PowerShell). No toques archivos del checkout principal.
4. Ejecuta el requerimiento completo dentro de ese worktree: cambios de codigo, tests, build, etc, todo aislado.
5. Al terminar, resume: nombre del worktree, branch, path (`.trees/<nombre>`), y estado (tests/build ok o no). No hagas commit/push ni elimines el worktree salvo que el usuario lo pida explicitamente.
