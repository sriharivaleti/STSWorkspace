package com.in28minutes.rest.webservices.todo;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@CrossOrigin
public class TodoResource {
	
	@Autowired
	private TodoHardCodedService todoHardCodeService;
	
	
	@GetMapping(path="/users/{username}/todos")
	public List<Todo> getTodos(@PathVariable String username){
		return this.todoHardCodeService.findAll();
	}
	
	@GetMapping(path="/users/{username}/todos/{id}")
	public Todo getTodo(@PathVariable String username, @PathVariable long id){
		return this.todoHardCodeService.findById(id);
	}
	
	//DELETE /users/{username}/todos/{id}
	@DeleteMapping(path="/users/{username}/todos/{id}")
	public ResponseEntity<Void> deleteTodoById(@PathVariable String username, @PathVariable long id){
		if(this.todoHardCodeService.deleteById(id) != null)
			return ResponseEntity.ok().build();
		return ResponseEntity.notFound().build();
	}

	//PUT /users/{username}/todos/{id}
	@PutMapping(path="/users/{username}/todos/{id}")
	public ResponseEntity<Todo> updateTodoById(@PathVariable String username, @PathVariable long id, @RequestBody Todo todo){
	
		Todo updateTodo = this.todoHardCodeService.save(todo);
		return new ResponseEntity<Todo>(todo, HttpStatus.OK);
	}
	
	//Post /users/{username}/todos
	@PostMapping(path="/users/{username}/todos")
	public ResponseEntity<Void> createTodo(@PathVariable String username, @RequestBody Todo todo){
		
			Todo updateTodo = this.todoHardCodeService.save(todo);
			URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").build(updateTodo.getId());
			return ResponseEntity.created(uri).build();
	}
}
