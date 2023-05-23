```mermaid
flowchart LR

    A[Login] -- CASE HISTORY --> B[Case history]
    B-- Start a new case disabled -->C[My registration]
    B--Start a new case enabled -->D[Category]
    D--Select-->E[Profile confirmation]
    E--Proceed --> Z
    C --Continue --> Z[Main form]
    A-- START BY SELECTING YOUR CATEGORY --> D


```