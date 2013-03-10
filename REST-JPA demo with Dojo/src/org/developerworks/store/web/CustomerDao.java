package org.developerworks.store.web;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.TypedQuery;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.xml.bind.JAXBElement;

import org.developerworks.store.model.Customer;

import org.developerworks.store.model.cGroup;

@Path("/customers")
public class CustomerDao {
	private EntityManager mgr = DaoHelper.getInstance().getEntityManager();
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Customer addCustomer(JAXBElement<Customer> customer){
		Customer p = customer.getValue();
		EntityTransaction txn = mgr.getTransaction();
		txn.begin();
		cGroup t = p.getGroup();
		cGroup mt = mgr.merge(t);
		p.setGroup(mt);
		mgr.persist(p);
		txn.commit();
		return p;
	}
	
	@GET
	@Produces("application/json")
	public List<Customer> getAllPlayers(){
		TypedQuery<Customer> query = 
			mgr.createQuery("SELECT p FROM Customer p", Customer.class);
		return query.getResultList();
	}
}
