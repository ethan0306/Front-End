(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.VBox",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.QB.DBRoleSetting",
            "mstrmojo.QB.DBRoleSettingPulldown",
            "mstrmojo.QB.DBRoleSettingCheckbox"
            );
	
	function trim(str) {
	    if (!str) return "";
	    
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	
	function getDBType(list, type){
		var p = list.tbl.contents;
		
		switch (type){
			case list.SupportedDBTypes.SupportedDBTypesUndefined:
				
				if (!p.dsnlist.selectedItem) return list.DatabaseTypes.DatabaseTypeReserved;
				
				switch (p.dsnlist.selectedItem.des){
					case "MicroStrategy ODBC Driver for SQL Server Wire Protocol":
		            case "SQL Server":
		            	return list.DatabaseTypes.DatabaseTypeSQLServer;
		
		            case "MicroStrategy ODBC Driver for DB2 Wire Protocol":
		            case "DB2 Wire":
		            case "DB2 iSeries":
		            case "DB2 z/OS":
		            	return list.DatabaseTypes.DatabaseTypeDB2;
		
		            case "MicroStrategy ODBC Driver for Greenplum Wire Protocol":
		            	return list.DatabaseTypes.DatabaseTypePostgreSQL;
		                
		            case "MicroStrategy ODBC Driver for Informix Wire Protocol":
		            case "Informix Wire":
		            case "Informix XPS":
		            case "MicroStrategy ODBC Driver for Informix XPS":
		                return list.DatabaseTypes.DatabaseTypeInformix;
		
		            case "MicroStrategy ODBC Driver for MySQL Wire Protocol":
		            case "MySQL":
		            case "MySQL ODBC 5.1 Driver":
		            case "MySQL ODBC 3.51 Driver":
		            	return list.DatabaseTypes.DatabaseTypeMySQL;
		
		            case "MicroStrategy ODBC Driver for Oracle Wire Protocol":
		            case "Oracle":
		            case "Microsoft ODBC for Oracle":
		            case "iAnywhere Solutions 11 - Oracle":
		                return list.DatabaseTypes.DatabaseTypeOracle;
		                
		            case "MicroStrategy ODBC Driver for PostgreSQL Wire Protocol":
		            case "Postgre SQL":
		                return list.DatabaseTypes.DatabaseTypePostgreSQL;
		                
		            case "MicroStrategy ODBC Driver for Sybase ASE Wire Protocol":
		            case "Sybase ASE":
		            case "Sybase IQ":
		            case "Sybase IQ 12.7 ODBC":
		            case "Sybase IQ 15.x ODBC":
		            case "Adaptive Server IQ":
		            case "Sybase IQ 12.7 ODBC Driver":
		            case "Sybase IQ 15.x ODBC Driver":                                                         
		            	return list.DatabaseTypes.DatabaseTypeSybase;
		                
		            case "SQL Anywhere 11":
		            case "Adaptive Server Anywhere 9.0":
		                return list.DatabaseTypes.DatabaseTypeSybaseSQLAny;
		            
		            case "nCluster ANSI":
		            case "nCluster":
		                return list.DatabaseTypes.DatabaseTypeAster;
		
		            case "HPODBC":
		            case "HP ODBC 2.0":
		                return list.DatabaseTypes.DatabaseTypeNeoview;
		
		            case "NetezzaSQL":
		                return list.DatabaseTypes.DatabaseTypeNetezza;
		
		            case "Red Brick 6.3 Driver":
		            case "Red Brick (32) Driver":
		            case "Red Brick (64) Driver":
		                return list.DatabaseTypes.DatabaseTypeRedBrick;
		
		            case "TERADATA_SERVER":
		            case "Teradata":
		            case "Teradata Driver":
		                return list.DatabaseTypes.DatabaseTypeTeradata;
		
		            case "MicroStrategy ODBC Driver for Text":
		            case "Microsoft Text Driver (*.txt; *.csv)":
		                return list.DatabaseTypes.DatabaseTypeGeneric;
		
		            case "Vertica driver":
		            case "Vertica ODBC Driver 3.5":
		            case "Vertica ODBC Driver 4.0":
		                return list.DatabaseTypes.DatabaseTypeVertica;
		
		            case "Microsoft Access Driver (*.mdb)":
		            case "Driver do Microsoft Access (*.mdb)":
		            case "Microsoft Access-Treiber (*.mdb)":
		                return list.DatabaseTypes.DatabaseTypeAccess;
		
		            case "Microsoft Excel Driver (*.xls)":
		            case "Microsoft Excel-Treiber (*.xls)":
		            case "Driver do Microsoft Excel(*.xls)":
		                return list.DatabaseTypes.DatabaseTypeExcel;
		
		            case "OpenAccess for Salesforce":
		            case "MicroStrategy OpenAccess for Salesforce (Workstation)":
		                return list.DatabaseTypes.DatabaseTypeOpenAccess;
		
		            case "Hive ODBC Driver":
		            case "Hive Driver v1":
		            	return list.DatabaseTypes.DatabaseTypeHive;
		
		            case "ParAccel":
		            	return list.DatabaseTypes.DatabaseTypeParAccel;
		            	
		            default:
		                return list.DatabaseTypes.DatabaseTypeGeneric; //Default
		        }
			    
			case list.SupportedDBTypes.SupportedDBTypesDB2Wire:        
			case list.SupportedDBTypes.SupportedDBTypesDB2iSeries: 
			case list.SupportedDBTypes.SupportedDBTypesDB2ZOS:
				return list.DatabaseTypes.DatabaseTypeDB2;
				
			case list.SupportedDBTypes.SupportedDBTypesInformixWire: 
			case list.SupportedDBTypes.SupportedDBTypesInformixXPS: 
				return list.DatabaseTypes.DatabaseTypeInformix;
				
			case list.SupportedDBTypes.SupportedDBTypesPostgreSQL:
				return list.DatabaseTypes.DatabaseTypePostgreSQL;
				
			case list.SupportedDBTypes.SupportedDBTypesSybaseASE: 
			case list.SupportedDBTypes.SupportedDBTypesSybaseIQ: 
				return list.DatabaseTypes.DatabaseTypeSybase;
				
			case list.SupportedDBTypes.SupportedDBTypesOracle: 
				return list.DatabaseTypes.DatabaseTypeOracle;
				
			case list.SupportedDBTypes.SupportedDBTypesSQLServer: 
				return list.DatabaseTypes.DatabaseTypeSQLServer;
				
			case list.SupportedDBTypes.SupportedDBTypesTeradata: 
				return list.DatabaseTypes.DatabaseTypeTeradata;
				
			case list.SupportedDBTypes.SupportedDBTypesMySQL: 
				return list.DatabaseTypes.DatabaseTypeMySQL;
				
			case list.SupportedDBTypes.SupportedDBTypesGreenPlum: 
				return list.DatabaseTypes.DatabaseTypePostgreSQL;
				
			case list.SupportedDBTypes.SupportedDBTypesNetezza: 
				return list.DatabaseTypes.DatabaseTypeNetezza;
				
			case list.SupportedDBTypes.SupportedDBTypesXQuery: 
				return list.DatabaseTypes.DatabaseTypeXQuery;
				
			case list.SupportedDBTypes.SupportedDBTypesHive: 
				return list.DatabaseTypes.DatabaseTypeHive;
			
			default:
				return type;

		}
	}
	
	function checkEmptyText(caption, txt){
		if (txt == ""){
			return "";
		}
		else {
			return caption + txt + ";";
		}
	}
	
	function generateConnStr(list){
		var c = list.tbl.contents;
		var connstr;
		
		switch (list.type){
			case list.SupportedDBTypes.SupportedDBTypesUndefined:
				if (c.dsnlist.selectedItem){
					return checkEmptyText("DSN=",  c.dsnlist.selectedItem.n);
				}
				else{
					return "";
				}
					
				
			case list.SupportedDBTypes.SupportedDBTypesDB2Wire:   
				connstr = "DRIVER={MicroStrategy ODBC Driver for DB2 Wire Protocol};";
				
	            connstr = connstr + checkEmptyText("IpAddress=", c.children[0].text);
	            connstr = connstr + checkEmptyText("TcpPort=", c.children[1].text);
	            connstr = connstr + checkEmptyText("Database=",  c.children[2].text);
	            
	            return connstr;

			case list.SupportedDBTypes.SupportedDBTypesDB2iSeries:            
				connstr = "DRIVER={MicroStrategy ODBC Driver for DB2 Wire Protocol};";

				connstr = connstr + checkEmptyText("IpAddress=" , c.children[0].text);
				connstr = connstr + checkEmptyText("Collection=" , c.children[1].text);
				connstr = connstr + checkEmptyText("Location=" , c.children[2].text);
				connstr = connstr + checkEmptyText("DefaultIsolationLevel=" , c.children[3].selectedItem.v);
				connstr = connstr + checkEmptyText("PackageOwner=" , c.children[4].text);
				connstr = connstr + checkEmptyText("TcpPort=" , c.children[5].text);

				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesDB2ZOS:
				connstr = "DRIVER={MicroStrategy ODBC Driver for DB2 Wire Protocol};"

				connstr = connstr + checkEmptyText("IpAddress=", c.children[0].text);                                                                                
				connstr = connstr + checkEmptyText("Collection=", c.children[1].text);
				connstr = connstr + checkEmptyText("Location=", c.children[2].text);
				connstr = connstr + checkEmptyText("PackageCollection=", c.children[3].text);
				connstr = connstr + checkEmptyText("PackageOwner=", c.children[4].text);
				connstr = connstr + checkEmptyText("TcpPort=", c.children[5].text);

				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesInformixWire:
				connstr = "DRIVER={MicroStrategy ODBC Driver for Informix Wire Protocol};";

				connstr = connstr + checkEmptyText("ServerName=", c.children[0].text);
				connstr = connstr + checkEmptyText("HostName=", c.children[1].text);
				connstr = connstr + checkEmptyText("PortNumber=", c.children[2].text);
				connstr = connstr + checkEmptyText("Database=", c.children[3].text);

				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesInformixXPS:
				connstr = "DRIVER={MicroStrategy ODBC Driver for Informix XPS};";

				connstr = connstr + checkEmptyText("Database=", c.children[0].text);
				connstr = connstr + checkEmptyText("ServerName=", c.children[1].text);
				connstr = connstr + checkEmptyText("HostName=", c.children[2].text);
				connstr = connstr + checkEmptyText("Service=", c.children[3].text);
				connstr = connstr + checkEmptyText("Protocol=", c.children[4].selectedItem.v);

				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesPostgreSQL:
				connstr = "DRIVER={MicroStrategy ODBC Driver for PostgreSQL Wire Protocol};";

				connstr = connstr + checkEmptyText("HostName=", c.children[0].text);
				connstr = connstr + checkEmptyText("PortNumber=", c.children[1].text);
				connstr = connstr + checkEmptyText("Database=", c.children[2].text);

				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesSybaseASE:
				connstr = "DRIVER={MicroStrategy ODBC Driver for Sybase ASE Wire Protocol};";

				connstr = connstr + checkEmptyText("NetworkAddress=", c.children[0].text);
				connstr = connstr + checkEmptyText("Database=", c.children[1].text);

				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesSybaseIQ:
				var dbms = list.parent.dbmslist.selectedItem;
				switch(dbms.db_ver){
					case list.DatabaseVersions.DatabaseVersionDBSybaseIQ127:
						connstr = "DRIVER={Adaptive Server IQ};";
						break;
						
					default:
						connstr = "DRIVER={Sybase IQ};";
						connstr = connstr + "DriverUnicodeType=1;";
						break;
				}      
				
				connstr = connstr + checkEmptyText("EngineName=", c.children[0].text);
				connstr = connstr + checkEmptyText("DatabaseName=", c.children[3].text);
				
				var commLinks = checkEmptyText("host=", c.children[1].text);
				commLinks = commLinks + checkEmptyText("port=", c.children[2].text);

				connstr = connstr + "CommLinks=tcpip(" + commLinks + ");";
				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesOracle:
				connstr = "DRIVER={MicroStrategy ODBC Driver for Oracle Wire Protocol};"

				if (c.RB0.checked) //index 0
				{                                              
					connstr = connstr + checkEmptyText("HostName=", c.children[1].text);
					connstr = connstr + checkEmptyText("PortNumber=", c.children[2].text);
					connstr = connstr + checkEmptyText("SID=", c.children[3].text);
					connstr = connstr + checkEmptyText("ServiceName=", c.children[4].text);
					connstr = connstr + checkEmptyText("AlternateServers=", c.children[5].text);
				}
				else if (c.RB1.checked) //index 6
				{
					connstr = connstr + checkEmptyText("ServerName=", c.children[7].text);
					connstr = connstr + checkEmptyText("TNSNamesFile=", c.children[8].text);
				}
				return connstr;   
					
			case list.SupportedDBTypes.SupportedDBTypesSQLServer:   
				var mdl = mstrmojo.all.QBuilderModel;
				var svr, prt;
				var ar=new Array();
				
				if (mdl.drivers.indexOf("MicroStrategy ODBC Driver for SQL Server Wire Protocol") >= 0)
				{
					connstr = "DRIVER={MicroStrategy ODBC Driver for SQL Server Wire Protocol};";
				}
				else
				{
					connstr = "DRIVER={SQL Server};";
				}	
					svr=c.children[0].text;
					if (svr.indexOf(",")===-1){
						connstr = connstr + checkEmptyText("Server=", c.children[0].text);
					}
					else{
						ar=svr.split(",");
						svr=ar[0];
						prt=ar[1];
						connstr = connstr + checkEmptyText("Server=", svr);
						connstr = connstr + checkEmptyText("Port=", prt);
					}
				connstr = connstr + checkEmptyText("Database=", c.children[1].text);
				connstr = connstr + checkEmptyText("UseWindowsAuthenticationForLogin=", c.children[2].checked);
				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesTeradata:                                                               
				connstr = "DRIVER={Teradata};";
				connstr = connstr + checkEmptyText("DBCName=", c.children[0].text);
				connstr = connstr + checkEmptyText("Database=", c.children[1].text);
				connstr = connstr + checkEmptyText("UseIntegratedSecurity=", c.children[2].checked);

				//validate empty string
				var s = c.children[3].selectedItem.v;
				if (s == "&nbsp;") s = "";
					
				connstr = connstr + checkEmptyText("Authentication Mechanism=", s);
				connstr = connstr + checkEmptyText("Authentication Mechanism Data=", c.children[4].text);                                     
			
				return connstr;
			
			case list.SupportedDBTypes.SupportedDBTypesMySQL:
				connstr = "DRIVER={MicroStrategy ODBC Driver for MySQL Wire Protocol};";
				connstr = connstr + checkEmptyText("HostName=", c.children[0].text);
				connstr = connstr + checkEmptyText("PortNumber=", c.children[1].text);
				connstr = connstr + checkEmptyText("Database=", c.children[2].text);
			
				return connstr;                   
					
			case list.SupportedDBTypes.SupportedDBTypesGreenPlum:
				connstr = "DRIVER={MicroStrategy ODBC Driver for Greenplum Wire Protocol};";
				connstr = connstr + checkEmptyText("HostName=", c.children[0].text);
				connstr = connstr + "PortNumber=5432;";
				connstr = connstr + checkEmptyText("Database=", c.children[1].text);
				connstr = connstr + checkEmptyText("AlternateServers=", c.children[2].text);
			
				return connstr;
			
			case list.SupportedDBTypes.SupportedDBTypesNetezza:
				connstr = "DRIVER={NetezzaSQL};";
				connstr = connstr + checkEmptyText("servername=", c.children[0].text);
				connstr = connstr + checkEmptyText("port=", c.children[1].text);
				connstr = connstr + checkEmptyText("database=", c.children[2].text);
			
				return connstr;   
				
			case list.SupportedDBTypes.SupportedDBTypesXQuery:
				connstr = "XQUERY;";
				
				return connstr;
				
			case list.SupportedDBTypes.SupportedDBTypesHive:
				var mdl = mstrmojo.all.QBuilderModel;
				
				if (mdl.drivers.indexOf("Hive Driver v1") >= 0)
				{
					connstr = "DRIVER={Hive Driver v1};";   
				}
				else
				{
					connstr = "DRIVER={Hive ODBC Driver};";
				}
			
				connstr = connstr + checkEmptyText("HOST=", c.children[0].text);
				connstr = connstr + checkEmptyText("PORT=", c.children[1].text);
				connstr = connstr + checkEmptyText("DATABASE=", c.children[2].text);
				 
				return connstr;
		}
	}
	
	function applyContents(l, suppdb){
		if (l.info.connstr){
			
			var c = l.tbl.contents;
			
			var conn = l.info.connstr;
			conn = conn.split(";")[0];
			
			var conntype = (conn.split("=")[0]).toUpperCase();
		
			switch (conntype){
				case "DSN":
					conn = conn.substring(conntype.length + 1, conn.length)
					c.dsnlist.set("selectedID", conn);
					break;
					
				case "XQUERY":
					break;
					
				default: //driver
					conn = l.info.connstr;
					
					//remove info for sybase
					conn = conn.replace("CommLinks=tcpip(","");
					conn = conn.replace(")","");
					
					var items = conn.split(";");
					var id=mstrmojo.array.indexOf;
					var index = id(items,"");
					
					while (index >-1) {
						items.splice(index,1);
						index =id(items,""); 
					}
					
					var driver = (items[0].split("=")[1]);
					driver = driver.replace("{","");
					driver = driver.replace("}","");
					
					switch (driver){
						case "MicroStrategy ODBC Driver for DB2 Wire Protocol":
							switch (suppdb){
								case l.SupportedDBTypes.SupportedDBTypesDB2Wire:
									for (var i = 1; i < items.length; i++){
										var item = items[i].split("="); 
										switch (item[0]){
											case "IpAddress": c.children[0].set("text", item[1]); break;
											case "TcpPort": c.children[1].set("text", item[1]); break;
											case "Database": c.children[2].set("text", item[1]); break;
										}							
									}
									break;
								case l.SupportedDBTypes.SupportedDBTypesDB2iSeries:
									for (var i = 1; i < items.length; i++){
										var item = items[i].split("="); 
										switch (item[0]){
											case "IpAddress": c.children[0].set("text", item[1]); break;
											case "Collection": c.children[1].set("text", item[1]); break;
											case "Location": c.children[2].set("text", item[1]); break;
											case "DefaultIsolationLevel": c.children[3].set("selectedID", item[1]); break;
											case "PackageOwner": c.children[4].set("text", item[1]); break;
											case "TcpPort": c.children[5].set("text", item[1]); break;
										}							
									}
									break;
								case l.SupportedDBTypes.SupportedDBTypesDB2ZOS:
									for (var i = 1; i < items.length; i++){
										var item = items[i].split("="); 
										switch (item[0]){
											case "IpAddress": c.children[0].set("text", item[1]); break;
											case "Collection": c.children[1].set("text", item[1]); break;
											case "Location": c.children[2].set("text", item[1]); break;
											case "PackageCollection": c.children[3].set("text", item[1]); break;
											case "PackageOwner": c.children[4].set("text", item[1]); break;
											case "TcpPort": c.children[5].set("text", item[1]); break;
										}							
									}
									break;
							}
						break;
					case "MicroStrategy ODBC Driver for Informix Wire Protocol":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "ServerName": c.children[0].set("text", item[1]); break;
								case "HostName": c.children[1].set("text", item[1]); break;
								case "PortNumber": c.children[2].set("text", item[1]); break;
								case "Database": c.children[3].set("text", item[1]); break;
							}							
						}
						break;
						
					case "MicroStrategy ODBC Driver for Informix XPS":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "Database": c.children[0].set("text", item[1]); break;
								case "ServerName": c.children[1].set("text", item[1]); break;
								case "HostName": c.children[2].set("text", item[1]); break;
								case "Service": c.children[3].set("text", item[1]); break;
								case "Protocol": c.children[4].set("selectedID", item[1]); break;
							}							
						}
						break;
						
					case "MicroStrategy ODBC Driver for PostgreSQL Wire Protocol":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "HostName": c.children[0].set("text", item[1]); break;
								case "PortNumber": c.children[1].set("text", item[1]); break;
								case "Database": c.children[2].set("text", item[1]); break;
							}							
						}
						break;
						
					case "MicroStrategy ODBC Driver for Sybase ASE Wire Protocol":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "NetworkAddress": c.children[0].set("text", item[1]); break;
								case "Database": c.children[1].set("text", item[1]); break;
							}							
						}
						break;
						
					case "Adaptive Server IQ":
					case "Sybase IQ":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "EngineName": c.children[0].set("text", item[1]); break;
								case "host": c.children[1].set("text", item[1]); break;
								case "port": c.children[2].set("text", item[1]); break;
								case "DatabaseName": c.children[3].set("text", item[1]); break;
							}							
						}
						break;
						
					case "MicroStrategy ODBC Driver for Oracle Wire Protocol":
						var rb0 = false;
						var rb1 = false;
						
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "HostName": c.children[1].set("text", item[1]); rb0 = true; break;
								case "PortNumber": c.children[2].set("text", item[1]); rb0 = true; break;
								case "SID": c.children[3].set("text", item[1]); rb0 = true; break;
								case "ServiceName": c.children[4].set("text", item[1]); rb0 = true; break;
								case "AlternateServers": c.children[5].set("text", item[1]); rb0 = true; break;
								case "ServerName": c.children[7].set("text", item[1]); rb1 = true; break;
								case "TNSNamesFile": c.children[8].set("text", item[1]); rb1 = true; break;
							}		
						}
						if (rb0) c.RB0.set("checked", true);
						if (rb1) c.RB1.set("checked", true);
						
						break;
						
					case "MicroStrategy ODBC Driver for SQL Server Wire Protocol":
					case "SQL Server":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "Server": c.children[0].set("text", item[1]); break;
								case "Address": c.children[0].set("text", item[1]); break;
								case "Database": c.children[1].set("text", item[1]); break;
								case "UseWindowsAuthenticationForLogin": if (item[1] == "true") c.children[2].set("checked", true); break;
							}							
						}
						break;
						
					case "Teradata":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "DBCName": c.children[0].set("text", item[1]); break;
								case "Database": c.children[1].set("text", item[1]); break;
								case "UseIntegratedSecurity": if (item[1] == "true") c.children[2].set("checked", true); break;
								case "Authentication Mechanism": c.children[3].set("selectedID", item[1]); break;
								case "Authentication Mechanism Data": c.children[4].set("text", item[1]); break;
							}							
						}
						break;
					
					case "MicroStrategy ODBC Driver for MySQL Wire Protocol":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "HostName": c.children[0].set("text", item[1]); break;
								case "PortNumber": c.children[1].set("text", item[1]); break;
								case "Database": c.children[2].set("text", item[1]); break;
							}							
						}
						break;
							
					case "MicroStrategy ODBC Driver for Greenplum Wire Protocol":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "HostName": c.children[0].set("text", item[1]); break;
								case "Database": c.children[1].set("text", item[1]); break;
								case "AlternateServers": c.children[2].set("text", item[1]); break;
							}							
						}
						break;
						
					case "NetezzaSQL":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "servername": c.children[0].set("text", item[1]); break;
								case "port": c.children[1].set("text", item[1]); break;
								case "database": c.children[2].set("text", item[1]); break;
							}							
						}
						break;
					case "Hive Driver v1":   
					case "Hive ODBC Driver":
						for (var i = 1; i < items.length; i++){
							var item = items[i].split("="); 
							switch (item[0]){
								case "HOST": c.children[0].set("text", item[1]); break;
								case "PORT": c.children[1].set("text", item[1]); break;
								case "DATABASE": c.children[2].set("text", item[1]); break;
							}							
						}
						break;
					}      
					
					break;
			}
		}
	}

	
	function findIndex(l){
		//get the info from the connection string, we split the string in case more parameters are 
		//stored, but we assume the parameter is always the first one so we use index 0
		//The possible values are DSN=, DRIVER=, XQUERY=  
		//if it is empty, it's new
		if (l.info.connstr){
			var conn = l.info.connstr;
			conn = conn.split(";")[0];
			
			var conntype = (conn.split("=")[0]).toUpperCase();
			conn = conn.substring(conntype.length + 1, conn.length)
		
			switch (conntype){
				case "DSN":
					return l.SupportedDBTypes.SupportedDBTypesUndefined;
									
				case "XQUERY":
					return l.SupportedDBTypes.SupportedDBTypesXQuery;
					
				case "DRIVER":
					conn = conn.replace("{","");
					conn = conn.replace("}","");
					
					switch (conn){
                        //we need to map the driver with dbms ID to figure out the version as we do not have access to the 
                        //DBMS version from the db connection xml string as of 9/15/2010
                          case "MicroStrategy ODBC Driver for DB2 Wire Protocol":
                             switch(l.info.dbms) 
                             {
                                 case "68CD44318CF911D5804400C04F780688":
                                 case "68CD44358CF911D5804400C04F780688":
                                 case "6BBD10E2D0794AF7B7ED1E2AA06F6460":
                                 case "6BBD10E3D0794AF7B7ED1E2AA06F6460":
                                 case "080A7832229F4E92B01316C2250115FE":
                                     return l.SupportedDBTypes.SupportedDBTypesDB2iSeries;
                                 case "1D076B3E099F11D4800100C04F780688"://OS390
                                 case "68CD443B8CF911D5804400C04F780688"://Z OS
                                 case "38F387A18191493D8CBF8861BCAF7D41": //9.1
                                     return l.SupportedDBTypes.SupportedDBTypesDB2ZOS;
                                 default:
                                     return l.SupportedDBTypes.SupportedDBTypesDB2Wire;
                             }

                          case "MicroStrategy ODBC Driver for Informix Wire Protocol":
                                return l.SupportedDBTypes.SupportedDBTypesInformixWire;
                          case "MicroStrategy ODBC Driver for Informix XPS":
                                return l.SupportedDBTypes.SupportedDBTypesInformixXPS;
                          case "MicroStrategy ODBC Driver for PostgreSQL Wire Protocol":
                                return l.SupportedDBTypes.SupportedDBTypesPostgreSQL;
                          case "MicroStrategy ODBC Driver for Sybase ASE Wire Protocol":
                                return l.SupportedDBTypes.SupportedDBTypesSybaseASE;
                          case "MicroStrategy ODBC Driver for Oracle Wire Protocol":
                                return l.SupportedDBTypes.SupportedDBTypesOracle;
                          case "SQL Server":
                          case "MicroStrategy ODBC Driver for SQL Server Wire Protocol":
                                return l.SupportedDBTypes.SupportedDBTypesSQLServer;
                          case "MicroStrategy ODBC Driver for MySQL Wire Protocol":
                                return l.SupportedDBTypes.SupportedDBTypesMySQL;
                          case "Teradata":
                                return l.SupportedDBTypes.SupportedDBTypesTeradata;
                          case "Sybase IQ 12.7 ODBC":
                          case "Sybase IQ 15.x ODBC":
                          case "Sybase IQ":
                          case "Adaptive Server IQ":
                                return l.SupportedDBTypes.SupportedDBTypesSybaseIQ;
                          case "MicroStrategy ODBC Driver for Greenplum Wire Protocol":
                                return l.SupportedDBTypes.SupportedDBTypesGreenPlum;
                          case "NetezzaSQL":
                                return l.SupportedDBTypes.SupportedDBTypesNetezza;
                          case "Hive Driver v1":
                          case "Hive ODBC Driver":
                                return l.SupportedDBTypes.SupportedDBTypesHive;
                          default:
                        	  return l.SupportedDBTypes.SupportedDBTypesUndefined;
                    }
				default:
					return l.SupportedDBTypes.SupportedDBTypesUndefined;
			}
		}
		else{
			return l.SupportedDBTypes.SupportedDBTypesUndefined; //create a new one, we'll start with DSN
		}
	}
	
	function addControl(item, c){
		if (item.DBP){

			var dbp = item.DBP;
			
			for (var i = 0; i < dbp.length; i++){
				var d = dbp[i];
				var t; 
				var str = mstrmojo.desc(d.mojoIDS, d.n);
				
				switch (d.t){
					case "text":
						t = new mstrmojo.QB.DBRoleSetting({
							caption: str,
							alias: "dbp" + i
						});
						break;
						
					case "number":
						t = new mstrmojo.QB.DBRoleSetting({
							caption: str,
							isNumeric: true,
							alias: "dbp" + i
						});
						break;
						
					case "list":
						//by default the item field is defined in "v"
						var itf = "v";
						
						//if there is a name 
						if (d.PV[0].n) {
							//set the item field accordingly
							itf = "n";
							
							var pv = d.PV;
							
							//lets update the list with mojo descriptors and
							for (var pvi = 0; pvi < pv.length; pvi++){
								pv[pvi].n = mstrmojo.desc(pv[pvi].mojoIDS, pv[pvi].n);
							}
						}
							
						t = new mstrmojo.QB.DBRoleSettingPulldown({
							caption: str,
							alias: "dbp" + i,
							itemIdField: "v",
							itemField: itf,
							alias: "dbp" + i
						});
						
						t.render();
						t.set("items", d.PV);
						t.set("selectedID", d.PV[0].v);
						
						break;
						
					case "boolean":
						t = new mstrmojo.QB.DBRoleSettingCheckbox({
							caption: str
						});
						
						break;
				}
			
				c.addChildren([t]);
			}
		}
	}
	function getItemById(items, id){
		var item;
		for (var cn=0; cn<items.length; cn++){
			item=items[cn];
			if (item.id==id){
				return item;
			}
		}
	}
	
	
	function buildContents(list, index){
		var mdl = mstrmojo.all.QBuilderModel;
		var c = list.tbl.contents;
		var l = list.selectlist;
		
		if (!c) {return;}
		
		if ((mdl.isCloud)&& (index==0)){
			var item=getItemById(l.items,1);
		}
		else{
			var item=getItemById(l.items,index);
		}
		if (!item) {return;}	
		l.set("selectedID", item.id);
		list.type = item.id;
	
		if (item.id==list.SupportedDBTypes.SupportedDBTypesUndefined){
				
				if (c.children){c.removeChildren(null, true); }

				var s = new mstrmojo.QB.DBRoleSettingPulldown({
					caption: "dsn:",
					alias: "dsnlist",
				    itemIdField: 'n',
				    onChange: function(evt){ if (list.onDSNChange) {list.onDSNChange(getDBType(list, 0)); }}
				});
				
				s.set("items", mdl.dsns);
				c.addChildren([s]);
			}	
		else{
				//clear all the children
				if (c.children){c.removeChildren(null, true); }
			
				//check if DBPS exists (So far only Oracle)
				if (item.DBPS){
					var dbps = item.DBPS;
					
					//extract all the DBP and create all af them with a radio button to separate them
					for (idbps = 0; idbps < dbps.length; idbps++){
						var d = dbps[idbps];
						var str = mstrmojo.desc(d.mojoIDS, d.n);
						
						//radio button
						var r = new mstrmojo.RadioButton({
							label: str,
							alias: 'RB' + idbps,
							index: idbps,
							count: dbps.length,
							cssText: "padding-top: 15px;font-weight:900;",
							cssDisplay: "block",
							onclick : function() { //the radioButton do not completely finished
                                if (this.isChecked()) {
                                    
                                    for (j = 0; j < this.count; j++){
                                    	this.parent["RB" + j].set("checked",false);
                                    }
                                    this.set("checked", true);
                                }
                            }
						});
						c.addChildren([r]);
						
						//add the DBP object
						addControl(d, c);
					}
				}
				else{
					//There is no DBPS, so add the DBP object
					addControl(item, c);
				}
		}
	}
	
    function addContents(dsnc){
		var mdl = mstrmojo.all.QBuilderModel;
		dsnc.selectlist.set("items", mdl.suppdbs);
	};
	
    /**
	 * <p>
	 * Widget that represents the general info of a db role
	 * </p>
	 * 
	 * @class
	 * @extends mstrmojo.Box
	 */
    mstrmojo.QB.DBRoleDSNConnection = mstrmojo.declare(
    		// superclass
    		mstrmojo.Box,
    		
    		// mixins
    		null,
    		
    		{
    			/**
				 * @Class name
				 */
    			scriptClass: "mstrmojo.QB.DBRoleDSNConnection",
    			
    			postBuildRendering: function() {
            		if(this._super) {this._super();}
            		addContents(this);
            	},
            	
    			info: null,
    			oninfoChange: function(evt){
            		var suppdb = findIndex(this);
            		buildContents(this, suppdb); 
					applyContents(this, suppdb);
				},
				
				onDSNChange:null,
				onConnectionChange:null,
				
				children: [ {	scriptClass: "mstrmojo.QB.DBRoleSettingPulldown",
				        	   	alias: "selectlist",
		 		        	   	itemIdField: 'id',
				        	    caption: mstrmojo.desc(7820, "select:"),
				        	    onChange: function(evt){ 
								var mdl=mstrmojo.all.QBuilderModel;	
								
								if (!mdl.isCloud){
									buildContents(this.parent, evt.value);
									//return the dbtype that is selected
									if (this.parent.onConnectionChange) {this.parent.onConnectionChange(this.parent.type); }
								}
								else
								{	
									if (!this.selectedItem.id){
										buildContents(this.parent, 1);
										//return the dbtype that is selected
										if (this.parent.onConnectionChange) {this.parent.onConnectionChange(1); }
									}
									else{
										buildContents(this.parent, this.selectedItem.id );
										//	return the dbtype that is selected
										if (this.parent.onConnectionChange) {this.parent.onConnectionChange(this.selectedItem.id); }
									}
								}
									
								}
							},				            
							{   scriptClass: "mstrmojo.Table",
								rows: 1,
						        cols: 2,
						        alias: "tbl",
						        cssText: "width:100%;",
						        layout: [{cells: [{cssText: "width: 5%;"}, {cssText: "width:95%; padding:5px"}]}],
						        children : [{	scriptClass: "mstrmojo.VBox",
				          		        	   	alias:"contents",
				          		        	   	cssText: "width:100%; border-style:solid; border-width:1px; border-color:#AAAAAA; background-color: #F0F0F0",
				          		        	   	slot: "0,1"
				          		           	}]
								}],
				
				type: 0,
				
				supportedToType: function(supptype) { return getDBType(this, supptype); },
				
    			connstr: function(){ return generateConnStr(this); },
    			dbtype: function(){ return getDBType(this, this.type); },
    			
    			DatabaseVersions: {
    					"DatabaseVersionDatabaseVersionDefault": -1, // default minor version 
    					"DatabaseVersionDatabaseVersionReserved": 0, // invalid value
    					"DatabaseVersionDBTandemMPD45": 1, // C: Tandem NonStop SQL/MP D45
    					"DatabaseVersionDBTandemMX1": 2, // R: Tandem NonStop SQL/MX 1
    					"DatabaseVersionDBTandemMPD42": 3, // X: Tandem NonStop SQL/MPD42
    					"DatabaseVersionDBTeradataV2R1": 4, // X: NCR Teradata V2R1
    					"DatabaseVersionDBTeradataV2R20002": 5, // X: NCR Teradata V2R2.00.02
    					"DatabaseVersionDBTeradataV2R21": 6, // C: NCR Teradata V2R2.1
    					"DatabaseVersionDBTeradatav2R3": 7, // C: NCR Teradata V2R3
    					"DatabaseVersionDBOracle733": 8, // C: Oracle 7.3.3
    					"DatabaseVersionDBOracle8003": 9, // C: Oracle 8.0.03
    					"DatabaseVersionDBSQLServer65": 10, // X: Microsoft SQL Server 6.5 SP4
    					"DatabaseVersionDBSQLServer70": 11, // C: Microsoft SQL Server 7.0
    					"DatabaseVersionDBAccess20": 12, // X: Microsoft Access 2.0
    					"DatabaseVersionDBAccess70": 13, // S: Microsoft Access 7.0
    					"DatabaseVersionDBSybaseAdaptive115": 14, // C: Sybase adaptive server 11.5
    					"DatabaseVersionDBSybaseSQL112": 15, // X: Sybase SQL server 11.2
    					"DatabaseVersionDBSybaseIQ112": 16, // X: Sybase IQ 11.2
    					"DatabaseVersionDBIBMDB2OS39041": 17, // X: IBM DB2/OS390 4.1
    					"DatabaseVersionDBIBMDB2OS39050": 18, // C: IBM DB2/OS390 5
    					"DatabaseVersionDBIBMUDBSMP50": 19, // X: IBM UDB/SMP 5.0
    					"DatabaseVersionDBIBMUDBEEE50": 20, // X: IBM UDB/EEE 5.0
    					"DatabaseVersionDBIBMDB2PE12": 21, // X: IBM DB2/PE 1.2
    					"DatabaseVersionDBIBMDB2CS212": 22, // X: IBM DB2/CS 2.1.2
    					"DatabaseVersionDBIBMDB2400V3R7": 23, // X: IBM DB2/400 V3R7
    					"DatabaseVersionDBIBMDB2400V4R1": 24, // X: IBM DB2/400 V4R1
    					"DatabaseVersionDBIBMDB2400V4R2": 25, // X: IBM DB2/400 V4R2
    					"DatabaseVersionDBInformixODS724UC1": 26, // X: Informix ODS 7.24UC1
    					"DatabaseVersionDBInformixXPS82": 27, // S: Informix XPS 8.2
    					"DatabaseVersionDBAdabaseD6112": 28, // S: Software AG Adabase-D6.1.1.2
    					"DatabaseVersionDBRedBrick5007": 29, // X: Red Brick 5.0.7
    					"DatabaseVersionDBRedBrick5012": 30, // X: Red Brick 5.0.12
    					"DatabaseVersionDBRedBrick5105": 31, // S: Red Brick 5.1.5
    					"DatabaseVersionDBTeradataNTV2R2": 32, // C: NCR Teradata NT V2R2
    					"DatabaseVersionDBTeradataNTV2R3": 33, // R: NCR Teradata NT V2R3
    					"DatabaseVersionDBOracle8i": 34, // R: Oracle 8i (e.g. 8.1.5)
    					"DatabaseVersionDBSybaseIQ12": 35, // R: Sybase IQ 12
    					"DatabaseVersionDBIBMUDB52": 36, // C: IBM UDB 5.2
    					"DatabaseVersionDBIBMDB2400V4R3": 37, // S: IBM DB2/400 V4R3
    					"DatabaseVersionDBInformixODS731": 38, // S: Informix ODS 7.31
    					"DatabaseVersionDBInformixUDO92": 39, // S: Informix UDO 9.2
    					"DatabaseVersionDBInformixXPS83": 40, // R: Informix XPS 8.3
    					"DatabaseVersionDBIBMUDB61": 41, // R: IBM UDB 6.1
    					"DatabaseVersionDBOracle805": 42, // R: Oracle 8.0.5
    					"DatabaseVersionDBOracle8iR2": 43, // R: Oracle 8i R2
    					"DatabaseVersionDBIBMUDB7": 44, // R: IBM UDB 7.1/7.2 for Windows and Unix
    					"DatabaseVersionDBIBMDB2OS39062": 45, // R: IBM DB2/OS390 6.2
    					"DatabaseVersionDBIBMDB2OS3907": 46, // R: IBM DB2/OS390 7
    					"DatabaseVersionDBIBMDB2400V4R4": 47, // R: IBM DB2/400 V4R4
    					"DatabaseVersionDBIBMDB2400V4R5": 48, // R: IBM DB2/400 V4R5
    					"DatabaseVersionDBRedBrick6": 49, // R: Red Brick 6
    					"DatabaseVersionDBTeradataV2R4": 50, // R: NCR Teradata V2R4
    					"DatabaseVersionDBSybaseAdaptive12": 51, // R: Sybase Adaptive Server 12
    					"DatabaseVersionDBSQLServer2000": 52, // R: Microsoft SQL Server 2000
    					"DatabaseVersionDBAccess2000": 53, // R: Microsoft Access 2000
    					"DatabaseVersionDBInformix10": 54, // R: Informix 10
    					"DatabaseVersionDBOracle8iR3": 55, // R: Oracle 8i R3
    					"DatabaseVersionDBOracle9i": 56, // R: Oracle 9i
    					"DatabaseVersionRedBrick61": 57, // R: Red Brick 6.1
    					"DatabaseVersionDBIBMUDB8": 58, // R: IBM UDB 8 for Windows and Unix
    					"DatabaseVersionDBOracle8iR2SE": 59, // R: Oracle 8i R2 Standard Edition
    					"DatabaseVersionDBTeradataV2R41": 61, // R: NCR Teradata V2R4.1
    					"DatabaseVersionDBAccess2002": 62, // R: Microsoft Access 2002
    					"DatabaseVersionDBIBMDB2400V5R1": 63, // R: IBM DB2/400 V5R1
    					"DatabaseVersionDBSybaseAdaptive125": 64, // R: Sybase Adaptive Server 12.5
    					"DatabaseVersionDBRedBrick62": 65, // R: Red Brick 6.2
    					"DatabaseVersionDBIBMDB2400V5R2": 66, // R: IBM DB2/400 V5R2 
    					"DatabaseVersionDBTeradataV2R5": 67, // R: NCR Teradata V2R5
    					"DatabaseVersionMDXSAPBW30": 68, // R: SAP B/W 3.0
    					"DatabaseVersionDBOracle10g": 69, // R: Oracle 10g
    					"DatabaseVersionDBTeradataV2R51": 70, // R: NCR Teradata V2R5.1
    					"DatabaseVersionDBInformixIDS93": 71, // R: Informix IDS 9.3
    					"DatabaseVersionDBInformixIDS94": 72, // R: Informix IDS 9.4
    					"DatabaseVersionDBRedBrick63": 73, // R: Red Brick 6.3
    					"DatabaseVersionDBIBMDB2OS3908": 74, // R: IBM DB2 UDB for zSeries v8 (old 390 line)
    					"DatabaseVersionDBNetezza22": 75, // R: Netezza 2.2
    					"DatabaseVersionDBExcel2003": 76, // R: Excel 2000/2003
    					"DatabaseVersionDBNetezza25": 77, // R: Netezza 2.5
    					"DatabaseVersionMDXEssbaseHyperion": 78, // R: Hyperion Essbase
    					"DatabaseVersionMDXMicrosoftAS2005": 79, // R: Microsoft Analysis Services 2000
    					"DatabaseVersionDBMySQL50": 80, // R: MySQL 5.0
    					"DatabaseVersionDBPostgreSQL81": 81, // R: PostgreSQL 8.1
    					"DatabaseVersionDBInformixIDS10": 82, // R: Informix IDS 10.0
    					//@deprecated use {@link #DatabaseVersionDBInformixIDS10} instead
    					"DatabaseVersionDBInformixIDS11": 82,
    					"DatabaseVersionDBOracle10gR2": 83, // R: Oracle 10g R2
    					"DatabaseVersionDBTeradataV2R6": 84, // R: NCR Teradata V2 R6
    					"DatabaseVersionDBTeradataV2R61": 85, // R: NCR Teradata V2 R6.1
    					"DatabaseVersionDBSybaseASE15": 86, // R: Sybase ASE 15
    					"DatabaseVersionDBSQLServer2005": 87, // R: Microsoft SQL Server 2005	 
    					"DatabaseVersionMDXMicrosoftAS2000": 88, // R: Microsoft Analysis Services 2000
    					"DatabaseVersionDBIBMDB2400V5R4": 89, // R: IBM DB2/400 V5R4
    					"DatabaseVersionDBNetezza3": 90, // R: Netezza 3.0
    		    
    					// @deprecated use {@link #DatabaseVersionDBNetezza3} instead
    		     		"DatabaseVersionDBNetezza30": 90, // R: Netezza 3.0

    		     		"DatabaseVersionDBSybaseIQ127": 91, // R: Sybase IQ 12.7
    					"DatabaseVersionDBIBMUDB91": 92, // R: DB2 UDB V9.1 for Linux, UNIX, and Windows
    					"DatabaseVersionDBTeradataV2R62": 93, // R: NCR Teradata V2 R6.2
    					"DatabaseVersionDBPostgreSQL82": 94, // R: PostgreSQL 8.2
    					
    					//@deprecated use {@link #DatabaseVersionDBPostgreSQL82} instead
    		     		"DatabaseVersionDBPostgreSQL83": 94,
    		     		
    					"DatabaseVersionDBHPNeoview22": 95, // R: HP Neoview 2.2
    		    
		    		    //@deprecated use {@link #DatabaseVersionDBHPNeoview22} instead
    					"DatabaseVersionDBHPNeoview20": 95, // R: HP Neoview 2.X

    					"DatabaseVersionDBOracle11g": 96, // R: Oracle 11g
    					"DatabaseVersionDBNetezza4": 97, // R: Netezza 4.0
    		    
    					//@deprecated use {@link #DatabaseVersionDBNetezza4} instead
    					"DatabaseVersionDBNetezza40": 97, // R: Netezza 4.0
    		    
    					"DatabaseVersionMDXEssbaseHyperion9": 98, // R: Hyperion Essbase
    					"DatabaseVersionDBGreenplum3x": 99, // R: Greenplum 
    					"DatabaseVersionDBHPNeoview23": 100, // R: HP Neoview 2.3
    					"DatabaseVersionDBIBMUDB95": 101, // R: IBM DB2 UDB V9.5
    					"DatabaseVersionDBTeradata12": 102, // R: Teradata 1.2

    					//@deprecated use {@link #DatabaseVersionDBTeradata12} instead
    					"DatabaseVersionDBTeradata120": 102, // R: Teradata 1.2
    		    
    					"DatabaseVersionDBIBMUDB91zOS": 103, // R: IBM DB2 UDB 
    		    		"DatabaseVersionDBAccess2007": 104, // R: MicroSoft Access 2007
    		    		"DatabaseVersionDBIBMDB2400V6R1": 105, // R: IBM DB2
    		    		"DatabaseVersionDBMetamatrix55": 106, // R: Metamatrix
    		    		"DatabaseVersionDBDATAllegro3x": 107, // R: DATAllegro
    		    		"DatabaseVersionDBComposite450": 108, // R: Composite
    		    		"DatabaseVersionDBAccess2003": 109, // R: Access2003
    		    		"DatabaseVersionDBSQLServer2008": 110, // R: SQL Server 2008
    		    		"DatabaseVersionDBMySQL51": 111, // R: My SQL 
    		    		"DatabaseVersionMDXMicrosoftAS2008": 112, // R: MicroStoft Analysis Services2008
    		    		"DatabaseVersionDBAsternCluster30": 113, // R: Astern Cluster
    		    		"DatabaseVersionDBVertica25": 114, // R: Vertica 
    		    		"DatabaseVersionMDXEssbaseHyperion9x": 115, // R: Hyperion Essbase
    		    		"DatabaseVersionDBOpenAccess14": 116, // R: Open Access
    		    		"DatabaseVersionDBSybaseSQLAny11": 117, // R: Sybase SQL Anywhere 11
    		    		"DatabaseVersionDBNetezza46": 118, // R: Netezza 4.6
    		    		"DatabaseVersionDBTeradata13": 119, // R: Teradata 1.3
    		    		"DatabaseVersionDBSybaseIQ15": 120, // R: SybaseIQ 15
    		    		"DatabaseVersionDBSybaseIQ151": 121, // R: SybaseIQ 15.1
    		    		"DatabaseVersionDBHPNeoview24": 122, // R: HP Neoview 2.4
    		    		"DatabaseVersionDBIBMUDB97": 123, // R: IBM DB2 9.7
    		    		"DatabaseVersionDBNetezza50": 124, // R: Netezza 5.0
    		    		"DatabaseVersionDBVertica30": 125, // R: Vertica 3.0
    		    		"DatabaseVersionMDXSAPBW7x": 126, // R: SAPBW 7.x
    		    		"DatabaseVersionDBOracle11gR2": 127, // R: Oracle 11gR2
    		    		"DatabaseVersionDBInformixIDS115": 128, // R: InformixIDS 11.5 
    		    		"DatabaseVersionDBPostgreSQL84": 129, // R: Postgre SQL 8.4 
    		    		"DatabaseVersionDBSQLServer2008NativeClient": 130, // R: SQL Server 2008  
    		    		"DatabaseVersionDBSybaseIQ152": 139, // R: SybaseIQ 15.2
    		    		"DatabaseVersionDBHive05": 138, // R: Hive
    		    		"DatabaseVersionDBXQuery": 142, // R: Xquery
    		    		"DatabaseVersionParAccel": 151, // R: ParAccel
    					"DatabaseVersionDBHive06": 152, // R: Hive
    					"DatabaseVersionDBHive07": 153, // R: Hive
    					"DatabaseVersionDBHiveThrift": 156 // R: Hive
    		    		
    			},
    			
    			DatabaseTypes: {
    					"DatabaseTypeReserved": 0,
    					"DatabaseTypeAccess": 100,
    					"DatabaseTypeOracle": 200,
    					"DatabaseTypeSQLServer": 300,
    					"DatabaseTypeInformix": 400,
    					"DatabaseTypeSybase": 500,
    					"DatabaseTypeRedBrick": 600,
    					"DatabaseTypeDB2": 700,
    					"DatabaseTypeTandem": 800,
    					"DatabaseTypeTeradata": 900,
    					"DatabaseTypeUnknown": 1000,
    					"DatabaseTypeGeneric": 1100,
    					"DatabaseTypeSAP": 1200,
    					"DatabaseTypeNetezza": 1300,
    					"DatabaseTypeExcel": 1400,
    					"DatabaseTypeMicrosoftAS": 1500,
    					"DatabaseTypeEssBase": 1600,
    					"DatabaseTypeMySQL": 1700,
    					"DatabaseTypePostgreSQL": 1800,
    					"DatabaseTypeNeoview": 1900,
    					"DatabaseTypeMetamatrix": 2000, 
    					"DatabaseTypeDATAllegro": 2100, 
    					"DatabaseTypeComposite": 2200, 
    					"DatabaseTypeAster": 2300,
    					"DatabaseTypeVertica": 2400,
    					"DatabaseTypeOpenAccess": 2500,
    					"DatabaseTypeSybaseSQLAny": 2600,
    					"DatabaseTypeParAccel": 2800,
    					"DatabaseTypeXQuery": 3000,
    					"DatabaseTypeHive": 3100
    				},
    			
    			SupportedDBTypes: {
    					"SupportedDBTypesUndefined": 0,    
    					"SupportedDBTypesDB2Wire": 1,        
    					"SupportedDBTypesDB2iSeries": 2,
    					"SupportedDBTypesDB2ZOS": 3,
    					"SupportedDBTypesInformixWire": 4,
    					"SupportedDBTypesInformixXPS": 5,
    					"SupportedDBTypesPostgreSQL": 6,
    					"SupportedDBTypesSybaseASE": 7,
    					"SupportedDBTypesSybaseIQ": 8,
    					"SupportedDBTypesOracle": 9,
    					"SupportedDBTypesSQLServer": 10,
    					"SupportedDBTypesTeradata": 11,
    					"SupportedDBTypesMySQL": 12,
    					"SupportedDBTypesGreenPlum": 13,
    					"SupportedDBTypesNetezza": 14,
    					"SupportedDBTypesXQuery": 15,
    					"SupportedDBTypesHive": 16
    				}
    		}	    
	    );
})();