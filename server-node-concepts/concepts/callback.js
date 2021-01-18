function hola(nombre, miCallBack){
  setTimeout(function(){
    console.log('Hola, '+ nombre)
    miCallBack()
  }, 1000)
}

function adios(nombre, otroCallback){
  setTimeout(function(){
    console.log('Adios, '+ nombre)
    otroCallback()
  }, 1000)
}

console.log('Iniciando proceso...')

hola('GC', function(){
  adios('GC', function(){
    console.log('Terminando proceso')
  })
})
