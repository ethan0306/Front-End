mstrmojo.DynamicClassFactory = {
	newComponent: function (comp, mixins, props) {
        var name = comp.prototype.scriptClass.replace(/^mstrmojo./, ''); // remove the front mstrmojo package name
        for (var i = 0, cnt = mixins && mixins.length || 0; i < cnt; i++) {
        	if (!mixins[i]._mixinName){
        		alert("Need mixin have '_mixinName' to be used in DynamicClassFactory");
        		return null;
        	}
        	name += '_' + mixins[i]._mixinName.replace(/^mstrmojo./, ''); // remove the front mstrmojo package name
        }

        var f = mstrmojo[name];
        if (!f) {
             f = mstrmojo.declare(comp, mixins, props);
             mstrmojo[name] = f;
        }
        return f;
    }
};

