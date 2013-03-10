package org.developerworks.store.web;

import java.util.Collection;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.TypedQuery;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.developerworks.store.model.cGroup;

@Path("/groups")
public class GroupDao {
	
	private EntityManager mgr = DaoHelper.getInstance().getEntityManager();
	
	@GET
	@Produces("application/json")	
	public Collection<cGroup> getAll(){
		TypedQuery<cGroup> query = mgr.createQuery("SELECT t FROM cGroup t", cGroup.class);
		return query.getResultList();
	}
	
	@POST
	@Consumes("application/x-www-form-urlencoded")
	@Produces("application/json")
	public cGroup createGroup(@FormParam("groupName") String groupName){
		cGroup group = new cGroup();
		group.setName(groupName);
		EntityTransaction txn = mgr.getTransaction();
		txn.begin();
		mgr.persist(group);
		txn.commit();
		return group;
	}
}
