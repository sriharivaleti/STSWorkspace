package com.in28minutes.springboot.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.in28minutes.springboot.web.service.LoginService;

@Controller
public class LoginController {
	

//	@RequestMapping(value = "/hello", method = RequestMethod.GET)
//	@ResponseBody
//	public String sayHelloWorld() {
//		return "Hello";
//	}
	@Autowired
	LoginService loginService;
		
		
	@RequestMapping(value = "/hello", method = RequestMethod.GET)
	public String sayHelloWorld(@RequestParam String name, ModelMap model ) {
		model.put("requestname", name);
		return "hello";
	}
	
	@RequestMapping(value="/", method = RequestMethod.GET)
	public String loginPage() {
		return "login";
	}
	
	@RequestMapping(value="/login", method = RequestMethod.POST)
	public String welcomePage(@RequestParam String username, @RequestParam String password, ModelMap model  ) {
		
		boolean isvalidUser = this.loginService.validateUser(username, password);
		
		if(!isvalidUser) {
			model.put("errorMessage", "Bad Credentials");
			return "login";
		}
		model.put("username", username);
		model.put("password", password);
		return "welcome";
	}

}
