package com.in28minutes.springboot.web.service;

import org.springframework.stereotype.Component;

@Component
public class LoginService {
	
	public boolean validateUser(String username, String password) {
		
		if(username.equalsIgnoreCase("sreehari") && password.equals("sreehari")) {
			return true;
		}
			
		return false;
	}

}
