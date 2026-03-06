document.addEventListener("DOMContentLoaded", () => {
    cargarDatos2(document.getElementById('startDate').value,
    document.getElementById('endDate').value) 
    actualizar();
});
function actualizar(){
    const data = JSON.parse(localStorage.getItem("tablaDatos")) || [];

    // Actualizar las tarjetas del dashboard
    actualizarTarjetas(data);

// 2. NUEVO: Gráfico de Sucursales
    const datosSucursal = procesarDatosSucursal(data);
    crearGraficoSucursales(datosSucursal);

    //     // Procesar datos para el gráfico
    // const conteoPorVendedor = procesarDatosParaGrafico(data);
    //     // Crear el gráfico dinámico
    // crearGraficoPie(conteoPorVendedor);

     const datosAgrupados = procesarDatosPorDia(data);

    // // Crear gráfico de línea
    crearGraficoLinea(datosAgrupados);  

    // const conteo = procesarDatosParaGraficoBarra(data);
    // // Crear el gráfico dinámico
    // crearGraficoBarrasIdiomas(conteo);
} 

function cargarDatos2(fechaInicio,fechaFin) {
    if (fechaInicio && fechaFin) {
        fetchData2(fechaInicio, fechaFin)
        .then(() => {
                actualizar();
        })
        .catch((error) => {
            console.error("Error al cargar datos:", error);
        });
    
    actualizar;
 
} else {
  alert('Por favor, ingrese las fechas inicial y final.');
}
}


async function fetchData2(fechaInicio, fechaFin) {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    try {
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "ventas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bd,empresa,
                fi:fechaInicio,
                ff:fechaFin,
                vendedor:(session.vend ?? "").toString()
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
        // Guardar datos en localStorage para acceder desde otra página
        localStorage.setItem("tablaDatos", JSON.stringify(data));
         // Actualizar las tarjetas dinámicamente
    
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}
function actualizarTarjetas(data) {
    // 1. Cálculos financieros
    let totalVenta = 0;
    let totalCosto = 0;
    let totalConIva = 0;
    let totalUnidades = 0;

    data.forEach(item => {
        totalVenta += parseFloat(item.TOTAL || 0);
        totalCosto += parseFloat(item.COSTO_TOTAL || 0);
        totalConIva += parseFloat(item.TOTALCONIMPUESTO || 0);
        totalUnidades += parseFloat(item.CANTIDAD || 0);
    });

    const utilidad = totalVenta - totalCosto;
    const margen = totalVenta > 0 ? (utilidad / totalVenta) * 100 : 0;

    // 2. Inyectar valores con formato de moneda
    const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    document.getElementById('kpi-venta-neta').innerText = f.format(totalVenta);
    document.getElementById('kpi-utilidad').innerText = f.format(utilidad);
    document.getElementById('kpi-margen').innerText = margen.toFixed(2) + '';
    document.getElementById('kpi-total-iva').innerText = f.format(totalConIva);
    document.getElementById('kpi-costo').innerText = f.format(totalCosto);
    document.getElementById('kpi-unidades').innerText = totalUnidades.toLocaleString();
}



function procesarDatosParaGrafico(data) {
    // Agrupar y contar registros por nombre del vendedor
    const conteo = {};

    data.forEach(item => {
        const vendedor = item['NOMBRE VENDEDOR']; // Asegúrate de que el nombre coincida con tu tabla
        if (vendedor) {
            conteo[vendedor] = (conteo[vendedor] || 0) + 1;
        }
    });

    return conteo;
}
function procesarDatosParaGraficoBarra(data) {
    // Agrupar y contar registros por nombre del vendedor
    const conteo = {};

    data.forEach(item => {
        const vendedor = item['NOMBRE IDIOMA']; // Asegúrate de que el nombre coincida con tu tabla
        if (vendedor) {
            conteo[vendedor] = (conteo[vendedor] || 0) + 1;
        }
    });

    return conteo;
}
// Crear gráfico de línea
function crearGraficoLinea(datos) {
    const lineCanvas = document.getElementById('chart');
    const lineCtx = lineCanvas.getContext('2d');

    if (lineCanvas.chartInstance) {
        lineCanvas.chartInstance.destroy();
    }

    if (!lineCtx) {
        console.error('No se encontró el contenedor de chart.');
        return;
    }

    lineCanvas.chartInstance = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: datos.fechas, // Fechas como etiquetas
            datasets: [{
                label: 'Transacciones Diarias',
                data: datos.valores, // Conteo de transacciones
                borderColor: 'blue',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.1 // Suavizado opcional
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    },
                    ticks: {
                maxRotation: 45, // Rota las fechas para que quepan
                minRotation: 45,
                autoSkip: true, // Salta etiquetas si hay demasiadas
                maxTicksLimit: 15 // Muestra máximo 15 fechas para que no se amontone
            }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Ventas'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `Ventas: ${tooltipItem.raw}`;
                        }
                    }
                },
                datalabels: {
                   anchor: 'end',
    align: 'top',
    formatter: (value) => {
        // Si el valor es mayor o igual a 1000, lo divide por 1000 y añade la 'K'
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K'; 
        }
        return value.toLocaleString('en-US', { minimumFractionDigits: 2 });
    },
    font: {
        weight: 'bold',
        size: 12
    },
    color: '#000'
                }
            }
        },
        plugins: [ChartDataLabels] // Habilitar el plugin de etiquetas visibles
    });
}


function crearGraficoPie(conteo) {
    const labels = Object.keys(conteo); // Nombres de los vendedores
    const valores = Object.values(conteo); // Cantidad de registros por vendedor
    const total = valores.reduce((sum, val) => sum + val, 0); // Total de registros

    const lineCanvas = document.getElementById('pieChart');
    const lineCtx = lineCanvas.getContext('2d');

    if (lineCanvas.chartInstance) {
        lineCanvas.chartInstance.destroy();
    }



    if (!lineCtx) {
        lineCtx.error('No se encontró el contenedor de pieChart.');
        return;
    }

    lineCanvas.chartInstance  =    new Chart(lineCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#8E44AD', '#3498DB', '#E74C3C', '#2ECC71',
                    '#F39C12', '#C0392B'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const valor = tooltipItem.raw;
                            const porcentaje = ((valor / total) * 100).toFixed(2);
                            return `${labels[tooltipItem.dataIndex]}: ${valor} (${porcentaje}%)`;
                        }
                    }
                },
                // Etiquetas permanentes sobre el gráfico
                datalabels: {
                    color: '#fff', // Color del texto
                    anchor: 'end', // Ubicación de la etiqueta
                    align: 'start', // Alineación del texto
                    offset: 10, // Distancia desde el borde
                    font: {
                        weight: 'bold',
                        size: 14 // Tamaño de la fuente
                    },
                    formatter: (value, context) => {
                        // Calcular porcentaje
                        const porcentaje = ((value / total) * 100).toFixed(2);
                        return `${porcentaje}%`; // Mostrar porcentaje
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Habilitar el plugin de etiquetas permanentes
    });
}

function crearGraficoBarrasIdiomas(conteo) {
    const labels = Object.keys(conteo); // Idiomas como etiquetas
    const valores = Object.values(conteo); // Cantidad emitida por idioma
    const total = valores.reduce((sum, val) => sum + val, 0); // Total de valores

    const lineCanvas = document.getElementById('barChart');
    const lineCtx = lineCanvas.getContext('2d');

    if (lineCanvas.chartInstance) {
        lineCanvas.chartInstance.destroy();
    }

    if (!lineCtx) {
        lineCtx.error('No se encontró el contenedor de pieChart.');
        return;
    }

    lineCanvas.chartInstance  =    new Chart(lineCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad Emitida',
                data: valores,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#8E44AD', '#3498DB', '#E74C3C', '#2ECC71',
                    '#F39C12', '#C0392B'
                ],
                borderColor: '#000000', // Borde negro para todas las barras
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Idiomas',
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cantidad Emitida',
                        font: {
                            size: 14
                        }
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false // No mostrar leyenda
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const valor = tooltipItem.raw;
                            const porcentaje = ((valor / total) * 100).toFixed(2);
                            return `${labels[tooltipItem.dataIndex]}: ${valor} (${porcentaje}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#000', // Color del texto sobre las barras
                    anchor: 'end', // Ubicación de la etiqueta
                    align: 'start', // Alineación del texto
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    formatter: (value, context) => {
                        const porcentaje = ((value / total) * 100).toFixed(2);
                        return `${porcentaje}%`; // Mostrar porcentaje sobre las barras
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Habilitar el plugin de etiquetas
    });
}


// Agrupar datos por día
function procesarDatosPorDia(data) {
    const agrupados = {};

    data.forEach(item => {
        // Extraemos el timestamp de 'FECHA_FACTURA' como lo enviaste
        const timestamp = item['FECHA_FACTURA'].match(/\/Date\((\d+)\)\//);

        if (timestamp && timestamp[1]) {
            const fechaObj = new Date(parseInt(timestamp[1]));
            
            // Formatear la fecha en 'dd/MM/yyyy'
            const dia = String(fechaObj.getDate()).padStart(2, '0');
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            const anio = fechaObj.getFullYear();
            const fecha = `${dia}/${mes}/${anio}`;

            // SUMA DEL TOTAL: Cambiamos el +1 por el valor del campo TOTAL
            // Aseguramos que sea un número con parseFloat
            const venta = parseFloat(item['TOTAL'] || 0);
            agrupados[fecha] = (agrupados[fecha] || 0) + venta;
        }
    });

    // Ordenar las fechas cronológicamente para que el gráfico no salte
    const fechasOrdenadas = Object.keys(agrupados).sort((a, b) => {
        const [dA, mA, yA] = a.split('/');
        const [dB, mB, yB] = b.split('/');
        return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    });

    // Mapear los valores redondeados a 2 decimales
    const valores = fechasOrdenadas.map(fecha => parseFloat(agrupados[fecha].toFixed(2)));

    return { fechas: fechasOrdenadas, valores: valores };
}


// Función para procesar datos por sucursal
function procesarDatosSucursal(data) {
    const sucursales = {};

    data.forEach(item => {
        const nombre = item['BODEGA_NOMBRE'] || 'Sin Nombre';
        const venta = parseFloat(item.TOTAL || 0);
        
        sucursales[nombre] = (sucursales[nombre] || 0) + venta;
    });

    return sucursales;
}

// Función para crear el gráfico de barras horizontales (se ve mejor para sucursales)
function crearGraficoSucursales(conteo) {
    // 1. Convertir a Array y ORDENAR de mayor a menor
    const listaOrdenada = Object.entries(conteo)
        .map(([nombre, valor]) => ({ nombre, valor }))
        .sort((a, b) => b.valor - a.valor);

    const labels = listaOrdenada.map(item => item.nombre);
    const valores = listaOrdenada.map(item => item.valor);

    // 2. Definir paleta de colores (tonos profesionales)
    // Dejamos el último espacio para el rojo intenso
    const coloresBase = [
        '#36A2EB', '#4BC0C0', '#FFCE56', '#9966FF', 
        '#FF9F40', '#2ecc71', '#34495e', '#16a085', '#2980b9'
    ];

    // 3. Crear el array de colores final
    const coloresFinales = labels.map((_, index) => {
        // Si es el último elemento (el de menor venta), asignar Rojo
        if (index === labels.length - 1) {
            return '#e74c3c'; // Rojo para la menor venta
        }
        // Para los demás, usar la paleta circularmente
        return coloresBase[index % coloresBase.length];
    });

    const canvas = document.getElementById('branchChart');
    const ctx = canvas.getContext('2d');

    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    canvas.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Venta Total',
                data: valores,
                backgroundColor: coloresFinales,
                borderWidth: 1
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    formatter: (value) => {
                        // Redondeo a 2 decimales
                        return value.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                        });
                    },
                    color: '#444',
                    font: { weight: 'bold', size: 11 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    // Añadimos un margen del 20% al final para que el número no se encime
                    suggestedMax: Math.max(...valores) * 1.2,
                    ticks: {
                        callback: function(value) { return '$' + value.toLocaleString(); }
                    }
                }
            }
        }
    });
}