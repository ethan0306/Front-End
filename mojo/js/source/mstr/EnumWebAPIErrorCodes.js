/**
 * EnumWebAPIErrorCodes.js 
 * Copyright 2011 MicroStrategy Incorporated. All rights reserved.
 *
 * @fileoverview Conversion of BIWebSDK/code/java/src/com/microstrategy/utils/localization/WebAPIErrorCodes.java to JavaScript.
 * 
 * NOTE: that due to the Java file's size, only those error codes that are in use in the JavaScript code are listed here. Copy them from the Java file as necessary.
 *
 * NOTE: Due to differences in the number representations between Java and JavaScript, you must convert the constant values to signed two's completment
 *          where the JS constant value =   JAVA_CONSTANT - 0xFFFFFFFF - 1
 *
 * @author <a href="mailto:dhill@microstrategy.com">Doug Hill</a>
 * @version 1.0
 */

mstrmojo.mstr.EnumWebAPIErrorCodes = {
    	MSI_INBOX_MSG_NOT_FOUND:        -2147468986, // 0x80003946
		E_MSI_USERMGR_USER_NOTFOUND:    -2147209051, // 0x800430A5
		AUTHEN_E_LOGIN_FAIL_EXPIRED_PWD:-2147216963, // 0x800411BD
		
		E_UNUSED: 0xFFFFFFFF
};
