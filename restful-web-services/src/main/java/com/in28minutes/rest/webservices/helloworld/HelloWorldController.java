package com.in28minutes.rest.webservices.helloworld;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;


@RestController
@CrossOrigin
public class HelloWorldController {
	
	
	
//	@RequestMapping(path = "/hello-world", method = RequestMethod.GET )
//	public String sayHelloWorld() {
//		return "HelloWorld, This is Sreehari";
//	}

	@GetMapping(path = "/hello-world")
	public String sayHelloWorld() {
		return "HelloWorld, This is Sreehari";
	}
	
	@GetMapping(path = "/hello-world-bean")

	public HelloWorldBean getHelloWorldBean() {
		return new HelloWorldBean("HelloWorld-Sreehari");
	}
	
	@GetMapping(path = "/hello-world-bean/{message}")
	public HelloWorldBean getHelloWorldBeanPathVar(@PathVariable String message) {
		return new HelloWorldBean("HelloWorld "+message);
	}
}
