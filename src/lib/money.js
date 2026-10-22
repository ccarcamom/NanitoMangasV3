const fmt = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

export const formatCLP = (amount) => fmt.format(amount)
