package org.developerworks.store.model;

import java.util.Collection;


import javax.persistence.Entity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType (XmlAccessType.PROPERTY)
@Entity
public class cGroup {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	private String name;
	
	@OneToMany
	private Collection<Customer> customers;
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public void setCustomers(Collection<Customer>  customers) {
		this.customers =  customers;
	}
	public Collection<Customer> getCustomers() {
		return  customers;
	}
	
	public String toString(){
		return "Group[" + id + "] " + name;
	}
		
}
