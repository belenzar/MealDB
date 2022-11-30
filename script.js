function aplicacion(){

    const mostrar = document.querySelector('#mostrar');
    const modal = new bootstrap.Modal('#modal',{})

    const seleccionCategorias = document.querySelector('#categorias');
    

    if(seleccionCategorias){
        seleccionCategorias.addEventListener('change', categoriaSeleccionada);
        traerCategorias();
    }

    const guardadosDiv = document.querySelector('.guardados');
    if(guardadosDiv){
        verGuardados();
    }


    function traerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'; //primer endpoint
        fetch(url)
        .then(res => res.json())  //llamo al Json
        .then (result => desplegableCategorias (result.categories)) //muestro respuesta
    }

    function desplegableCategorias(categorias = []){
        categorias.forEach( categoria => {
            const opcion = document.createElement('option');
            opcion.value = categoria.strCategory; //Le asigno el value al <option>, y traigo los nombres del Json con "strCategory"
            opcion.textContent = categoria.strCategory;
            seleccionCategorias.appendChild(opcion);
        });
    }

    function categoriaSeleccionada(e){
        const categoria = e.target.value;
        const url= `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;  //segundo endpoint
        fetch(url)
            .then(resp => resp.json())
            .then(res => mostrarPlatos(res.meals))
         }
    
   function mostrarPlatos( platos = []){

        vaciar(mostrar);

        platos.forEach(plato => {
            const {idMeal, strMeal, strMealThumb} = plato;

           const receta = document.createElement('div'); //recetaContenedor
           receta.classList.add('col-md-4');

           const recetaContenedor = document.createElement('div'); //recetaCard
            recetaContenedor.classList.add('card', 'mb-4');

            const imagenReceta = document.createElement('img');
            imagenReceta.classList.add('card-img-top');
            imagenReceta.src =  strMealThumb ?? plato.img; //saco el img//nombre//de "recetasGuardadas"

            const contenidoReceta = document.createElement('div'); //recetaCardbody
            contenidoReceta.classList.add('card-body');

            const tituloReceta = document.createElement('h3');
            tituloReceta.classList.add('card-title', 'mb-3');
            tituloReceta.textContent = strMeal ?? plato.nombre;

            const botonReceta = document.createElement('button');
            botonReceta.classList.add('btn', 'btn-danger', 'w-100');
            botonReceta.textContent = 'More';

            botonReceta.onclick = function(){
                seleccionReceta(idMeal ?? plato.id); //Llamo al id de "recetasGuardadas" asi me trae la descripición de la ventana Modal
            }
            


            //Armo la Card para mostrar en HTML
            contenidoReceta.appendChild(tituloReceta);
            contenidoReceta.appendChild(botonReceta);

            recetaContenedor.appendChild(imagenReceta);
            recetaContenedor.appendChild(contenidoReceta);

            receta.appendChild(recetaContenedor);

            mostrar.appendChild(receta);
        })
    }

    //Vacío el HTML antes de seleccionar otra opción
    function vaciar(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

    //Obtengo el id de la receta que voy a mostrar en la ventana modal
    function seleccionReceta(id){
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`; //tercer endpoint
        fetch(url)
        .then(res => res.json())
        .then(result => recetaModal(result.meals[0]))
    }

    function recetaModal(recetas){ //mostrar modal
        const {idMeal, strInstructions, strMeal, strMealThumb} = recetas; //llamo al id y a las instrucciones

        const encabezadoModal = document.querySelector('.modal .modal-title');
        const cuerpoModal = document.querySelector('.modal .modal-body');

        encabezadoModal.innerHTML = `<h2 class="text-center">${strMeal}</h2>`; 
        cuerpoModal.innerHTML = `<h3 class="text-center">Instructions</h3>
        <img src="${strMealThumb}" class="img-fluid"/>
        <p class="text-center">${strInstructions}</p>
        `; 

        //Botones ventana modal
        const pieModal = document.querySelector('.modal-footer');
        vaciar(pieModal); //Llamo a la funcion vaciar que hicimos más arriba para que no se agreguen más botones cada vez que elijo receta

        const favoritos = document.createElement('button');
        favoritos.classList.add('btn','col'); //se le agregan clases de Bootstrap
        favoritos.textContent = reemplazar(idMeal) ? 'Delete' : '♡ Save'; //condicional, si ya guardé la receta me da la opción de guardarla

        //Función para que no agregue el mismo id en el localStorage cuando guardo en Favoritos
        favoritos.onclick = function(){
            if(reemplazar(idMeal)){
                remover(idMeal);
                favoritos.textContent= '♡ Save';
                return
            }

        //Guardar receta favorita
            recetasGuardadas({
                id: idMeal,
                nombre: strMeal,
                img: strMealThumb,
            })
            favoritos.textContent= 'Delete';
        }

        const cerrarVentana = document.createElement('button');
        cerrarVentana.classList.add('btn','col'); //se le agregan clases de Bootstrap
        cerrarVentana.textContent = 'Close';
        cerrarVentana.onclick = function(){
            modal.hide()//cierra la ventana modal
        }

        pieModal.appendChild(favoritos);
        pieModal.appendChild(cerrarVentana);

        modal.show();//muestra modal
        
    }
    //guardamos en localStorage
   function recetasGuardadas(recetas){
        const guardados = JSON.parse(localStorage.getItem('guardados')) ?? [];
        localStorage.setItem('guardados', JSON.stringify([...guardados,recetas]));
    }

    //función para que no se guarden recetas de más en localstorage
    function reemplazar(id){
        const guardados = JSON.parse(localStorage.getItem('guardados')) ?? [];
        return guardados.some(guardados => guardados.id === id); 
    }

    //función para eliminar favoritos
    function remover(id){
        const guardados = JSON.parse(localStorage.getItem('guardados')) ?? [];
        const nuevosGuardados = guardados.filter(guardados => guardados.id !== id);
        localStorage.setItem('guardados', JSON.stringify(nuevosGuardados)); 
    }

    //
    function verGuardados(){
        const guardados = JSON.parse(localStorage.getItem('guardados')) ?? [];
        if(guardados.length){
            mostrarPlatos(guardados);
            return
        }
        const noGuardado = document.createElement('p');
        noGuardado.textContent = 'There are no recipes saved';
        mostrar.appendChild(noGuardado);

    }

}

document.addEventListener('DOMContentLoaded', aplicacion);