package com.in28minutes.rest.webservices.helloworld;

public class HelloWorldBean {
	
	String message;
	
	

	public HelloWorldBean(String message) {
		//super();
		this.message = message;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	@Override
	public String toString() {
		return "HelloWorld [message=" + message + "]";
	}
	
	

}
