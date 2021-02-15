package com.sumtotal.util.crypto;

public class PBAESCipherMainTest {
	
	public static void main(String[] args) {
		PBAESCipher cipher = new PBAESCipher();
		
		String orginalString="u=ajoy|r=RS_ROLE_ADMINISTRATOR,RS_ROLE_SUPERVISOR,RS_ROLE_USER|o=Expense";
		
		String encryptedPP = cipher.encrypt(orginalString);
		System.out.println(encryptedPP);
		System.out.println(cipher.decrypt("fljpHOwPRZaShTUxvQMKX5b8EsOQQffbLxw8vyOho5oYXQ4cokD+XxSJruTxaqXLrs4PZEMH+LMcvHyYI3wAlkU1d/IwiHT2gMvW7UBMsh2VFy1UKm5I+zx7l8CZlWFvpqYMIA4v6OGXBVStfn9fox01qwJJdRB1tw=="));
	}
	
	

}
