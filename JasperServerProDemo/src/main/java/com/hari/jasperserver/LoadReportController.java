package com.hari.jasperserver;

import java.util.List;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import com.sumtotal.util.crypto.PBAESCipher;

@Controller
public class LoadReportController {
	
	
	@RequestMapping("/")
	public String loadHomePage() {
		return "UserDetails.jsp";
	}
	
	/*
	 * private final ReportServerService reportServerService;
	 * 
	 * @Autowired public LoadReportController(ReportServerService
	 * reportServerService) { super(); requireNonNull(reportServerService,
	 * "The 'ReportServerService reportServerService' argument is required; it must not be null"
	 * ); this.reportServerService = reportServerService; }
	 */
	
	@RequestMapping("/reports")
	public String loadReportEntryPoint(HttpServletRequest req,Model model) {
		
		/* UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(reportServerService.getReportServerUrl());
		    ServletServerHttpRequest httpRequest = new ServletServerHttpRequest(request);
		    UriComponents uricomp = UriComponentsBuilder.fromHttpRequest(httpRequest).build();
		    builder.path("/flow.html");
		    builder.fragment(uricomp.getFragment());
		    model.addAttribute("url", builder.toUriString());
		    model.addAttribute("method", "post");
		    model.addAttribute("pp", reportServerService.createPreauthToken());
		    MultiValueMap<String, String> oqueryParams = uricomp.getQueryParams();
		    MultiValueMap<String, String> nqueryParams = new LinkedMultiValueMap<>();
		    for (Entry<String, List<String>> entry : oqueryParams.entrySet()) {
		      nqueryParams.put(entry.getKey(), entry.getValue().stream().map(e -> decode(e)).collect(Collectors.toList()));
		    }
		    model.addAttribute("queryParams", nqueryParams);
		    model.addAttribute("screenPrefNsNames", reportServerService.getScreenPrefNsNames().stream().collect(Collectors.joining(",")));
		    model.addAttribute("showTerminatedEmployees", reportServerService.showTerminatedEmployees());
		    model.addAttribute("durFormat", reportServerService.durFormat());
		    model.addAttribute("userLocale", reportServerService.getUserLocale());
		    
		     return "analytics/reportserverflow";
		    */
		model.addAttribute("url", req.getParameter("url"));
		model.addAttribute("pp", createPreauthToken(req.getParameter("key"),req.getParameter("username"),req.getParameter("org")));
		//model.addAttribute("pp", createPreauthToken());
		return "reportshome.jsp";
	}
	
	private Object createPreauthToken(String key, String username, String org) {
		System.out.println("Key :"+ key + " username : "+ username+"org : "+org);
		PBAESCipher cipher = new PBAESCipher();
		cipher.setPassPhrase(key);
		String orginalString="u="+username+"|r=RS_ROLE_ADMINISTRATOR,RS_ROLE_SUPERVISOR,RS_ROLE_USER|o="+org;
		System.out.println(orginalString);
		String encryptedPP = cipher.encrypt(orginalString);
		System.out.println(encryptedPP);
		return encryptedPP;
	}

	public String createPreauthToken() {
		//return "L5GXDbdOrg7qKiotRpf1ELNBbn2awgn1Vemyp+Y+ygSv4hALPvROTqY0cW6yjgPH0H6mSeCiWqUYDkHoqRtd4AQC5qEDGN9m2hBDAur4+CE=";
		
		return "CWgf1JzOcyOpftVSA7CxSEVf336176SMDx0GW9d9qE9bqZK+5txX00sBszThK9+BckBCqnhnbjPJ/nfg/5nJAZ1CIXLrm7Axyq5eV/Nra9OnW/xyaE0KhxN2vjZXc6755EUALcGnYckKX0MaqnDJtQ==";
//		
//		PBAESCipher cipher = new PBAESCipher();
//		String orginalString="u=Admin|r=RS_ROLE_ADMINISTRATOR,RS_ROLE_SUPERVISOR,RS_ROLE_USER|o=Expense";
//		
//		String encryptedPP = cipher.encrypt(orginalString);
//		System.out.println(encryptedPP);
//		return encryptedPP;
	}

}
