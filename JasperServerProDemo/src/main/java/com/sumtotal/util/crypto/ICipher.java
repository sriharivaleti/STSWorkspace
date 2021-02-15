package com.sumtotal.util.crypto;

import com.jaspersoft.jasperserver.api.common.crypto.CipherI;

public interface ICipher extends CipherI {
    public String getPassPhrase();
    public void setPassPhrase(String passPhrase);
}
