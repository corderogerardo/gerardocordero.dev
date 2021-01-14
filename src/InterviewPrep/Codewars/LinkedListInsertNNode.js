function Node(data){
  this.data = data;
  this.next = null;
}

//O(1), O(n), O(n^2), O(n^n), O(log n), O(n log n)

function InsertNth(head, index, data){
  // Your code goes here
  // Return the head of the list
  let counter = 0; //O(1)
  // crea un nuevo nodo
  let newNode = new Node(data); //O(1)
  // crea una copia de la linkedlist
  let next = head; //O(1)

  if(index === 0){
    // al nuevo nodo next le asigno la linked list
    newNode.next = head; //O(1)
    // reasigno la nueva linked list al head
    head = newNode; //O(1)
  } else{
    // va  a iterar para buscar el indice en la LL
    while(counter !== index-1){ // O(n)
      counter++; // O(n)
      next = next.next; // O(n)
    }
    // Cuando ya encuentra el indice crea un valor temporal del nodo actual
    let temp = next.next; //O(1)
    // reemplaza el nodo actual con el nuevo nodo
    next.next = newNode;//O(1)
    // enlaza el nuevo nodo con el nodo temporal
    newNode.next = temp;//O(1)
  }
  return head; //O(1)
}
// Node modify and Recursive solution
// function Node(data, nxt) {
//   this.data = data;
//   this.next = nxt;
// }
// function insertNth(head, index, data) {
//   if(index == 0) return new Node(data, head);
//   if(head && index > 0) {
//     head.next = insertNth(head.next, index - 1, data);
//     return head;
//   }
//   throw "Error";
// }

export {
  Node,
  InsertNth
}
