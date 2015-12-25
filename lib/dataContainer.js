var jQuery = require('jquery');
var science = require('science');
var colorbrewer = require('colorbrewer');

// load everything 
//require('jquery-ui/sortable');
//require('jquery-ui/tooltip');
require('jquery-ui');



var ExpressionData = function (data, options) {
	for (var attrname in data) { 
		this[attrname] = data[attrname]; 
	}
	this.opt = options;
	this.sortOrder = [];

};

ExpressionData.prototype.setAvailableFactors = function(){
	var groups = this.factorOrder;
	var fo = this.factorOrder;
	var sf = this.selectedFactors;
	var optFO = this.opt.renderedOrder;
	var optSF = this.opt.selectedFactors;

	if( typeof optFO !== 'undefined'){
		fo = this.opt.renderedOrder;
	}

	if(typeof optSF !== 'undefined' ){
		sf = this.opt.selectedFactors;
	}

	this.renderedOrder = jQuery.extend(true, {}, fo);
	this.selectedFactors = jQuery.extend(true, {},  sf);
	var factorOrder = this.defaultFactorOrder;

	this.factors = new Map();
	for (var f in factorOrder) {
		var g = factorOrder[f];
		for(var k in groups[g]){
			if(! this.factors.has(g)){
				this.factors.set(g, new Set());
			}
			var currentSet = this.factors.get(g);
			currentSet.add(k);
		}  
	}
};

ExpressionData.prototype.prepareColorsForFactors = function(){
  //this.factorColors = Map.new();
  this.totalColors = 8;
  self = this;
  var colors = [
  colorbrewer.Pastel2[this.totalColors],
  colorbrewer.Accent[this.totalColors],
  colorbrewer.Dark2[this.totalColors],
  colorbrewer.Set1[this.totalColors],
  colorbrewer.Set2[this.totalColors],
  colorbrewer.Paired[this.totalColors],
  colorbrewer.Pastel1[this.totalColors], 
  colorbrewer.Set3[this.totalColors]
  ];
  this.factorColors= new Map();  
  var i = 0;  
  this.factors.forEach(function(value, key, map){
  	var color = new Map();
  	var index =  i % self.totalColors ;
  	var currentColorSet = colors[index];
  	var j = 0;   
  	value.forEach(function(name){
  		color[name] = currentColorSet[j++ % self.totalColors ];
  	});
  	i ++ ; 
  	self.factorColors[key] = color;
  });
  return self.factorColors;
};


ExpressionData.prototype.isFiltered = function(group){
	var ret = true;
	for(var f in group.factors){
		if(this.selectedFactors[f]){
			ret &= this.selectedFactors[f][group.factors[f]];   
		}else{
			throw new Error('The factor ' + f + ' is not available (' + this.selectedFactors.keys + ')');
		}

	}
	return !ret;
};

ExpressionData.prototype.getSortedKeys = function(factor) {
	var i = this.defaultFactorOrder[factor];
	var obj = this.renderedOrder[i]
	var keys = []; 
	for(var key in obj) {
		keys.push(key);
	}
	return keys.sort(function(a,b){return obj[a] - obj[b];});
};


/*
The only parameter, sortOrder, is an array of the factors that will be used to sort. 
*/
ExpressionData.prototype.sortRenderedGroups = function(){
	var orderMap = {};
	var i;
	var sortable = this.renderedData[0].slice();
	var sortOrder =  this.sortOrder;
	var factorOrder= this.renderedOrder; 
	var sorted = sortable.sort(function(a, b){
		for(i in sortOrder){
			var o = sortOrder[i];
			if(factorOrder[o][a.factors[o]] > factorOrder[o][b.factors[o]]) {
				return 1;
			}
			if (factorOrder[o][a.factors[o]] < factorOrder[o][b.factors[o]]) {
				return -1;
			}
		}
		return a.id > b.id  ? 1 : -1;
	});

	for ( i = 0; i < sorted.length; i++) {
		sorted[i].renderIndex = i;
	};
	for(i = 0; i < this.renderedData.length; i++){
		for (var j = 0; j < sorted.length; j++) { 
			var obj = this.renderedData[i][sorted[j].id];
			obj.renderIndex = sorted[j].renderIndex;
		}
	}
};


//WARN: This method sets "this.renderedData" to the result of this call. 
//This means that the function is not stateles, but the object is the container
//For the data. It could be possible to make it "reentrant"
ExpressionData.prototype.getGroupedData = function(property, groupBy){
	var dataArray = [];
	for(var gene in this.values){
		if(!this.opt.showHomoeologues && 
			( 	
				gene !== this.gene &&  
				gene !==  this.compare 
				) 
			)
		{
			continue;
		}
		var i = 0;
		var innerArray;
		if(groupBy === 'ungrouped'){
			innerArray = []; 
			var data = this.values[gene][property];
			for(var o in data) {  
				var oldObject = data[o];
				var newObject = this._prepareSingleObject(i, oldObject);
				newObject.gene = gene;
				console.log(newObject);
				var filtered = this.isFiltered(newObject);
				if (! filtered){
					innerArray.push(newObject);
					i++;
				}

			}
			dataArray.push(innerArray);
		}else if(groupBy === 'groups'){
			innerArray = this._fillGroupByExperiment(i++, gene, property);
			dataArray.push(innerArray);
		}else if(groupBy.constructor === Array){
        	//This is grouping by factors.  
        	innerArray = this._fillGroupByFactor(i++, gene, property, groupBy);
        	dataArray.push(innerArray);
        }else{
        	console.log('Not yet implemented');
        }
    }if(this.renderedData){
    	this.setRenderIndexes(dataArray, this.renderedData);
    }
    this.renderedData = dataArray;
    return dataArray;
};

ExpressionData.prototype.calculateStats = function(newObject){
	var v = science.stats.mean(newObject.data);
	var stdev = Math.sqrt(science.stats.variance(newObject.data));
	newObject.value = v;
	newObject.stdev = stdev;

};

ExpressionData.prototype._prepareSingleObject = function(index, oldObject){
	var newObject = JSON.parse(JSON.stringify(oldObject));

	newObject.renderIndex = index;
	newObject.id = index;
	newObject.name = this.data.experiments[newObject.experiment].name;
	newObject.data = []; 
	newObject.data.push(oldObject.value); 
	newObject.value = oldObject.value;
	newObject.stdev = 0;
	var group = this.data.experiments[newObject.experiment].group;
	newObject.factors = this.data.groups[group].factors;
	return newObject;
};

ExpressionData.prototype._prepareGroupedByExperiment = function(index, group){
	var newObject= {};
	newObject.renderIndex = index;
	newObject.id = index;
	newObject.name = this.data.groups[group].description;
	newObject.data = [];
	newObject.factors = this.data.groups[group].factors;
	return newObject;
};

ExpressionData.prototype._prepareGroupedByFactor = function(index, description){
	var newObject= {};
	newObject.renderIndex = index;
	newObject.id = index;
	newObject.name = description;
	newObject.data = [];
	newObject.factors = {};
	return newObject;
};


ExpressionData.prototype._fillGroupByExperiment = function(index, gene, property){
	var groups ={};
	var innerArray = [];
	var data = this.values[gene][property];
	var g = this.groups;
	var e = this.experiments;
	var o;
	var filtered;
	var i = index;
	for(o in g){  
		var newObject = this._prepareGroupedByExperiment(i++,o);
		newObject.gene = gene;
		groups[o] = newObject;
	}
	for(o in e){
		groups[e[o].group].data.push(data[o].value);
	}
	i = index;
	for(o in groups){
		var newObject = groups[o];
		newObject.gene = gene;
		this.calculateStats(newObject);
		if(!this.isFiltered(newObject)){
			newObject.renderIndex = i;
			newObject.id = i++;
			innerArray.push(newObject);
		}

	}
	return innerArray;
};

ExpressionData.prototype._fillGroupByFactor = function(index, gene, property, groupBy){
	var groups ={};
	var innerArray = [];
	var data = this.values[gene][property];
	var g = this.groups;
	var e = this.experiments;
	var names = [];
	var o;
	var i = index;
	for(o in g){  

		var description = this.getGroupFactorDescription(g[o], groupBy);
		var longDescription = this.getGroupFactorLongDescription(g[o], groupBy);
		if(names.indexOf(description) === -1){
			var newObject = this._prepareGroupedByFactor(i++, description);
			newObject.gene = gene;
			newObject.longDescription = longDescription;
			var factorValues = this.getGroupFactor(g[o], groupBy);
			newObject.factors = factorValues;
			groups[description] = newObject;
			names.push(description);
		}
	}
	i = index;
	for(o in e){
		if(typeof data[o] === 'undefined' ){
    continue; //This is for the cases when the data is set up but not defined
}
  //console.log(g);
  var group = g[e[data[o].experiment].group];

  if(!this.isFiltered(group)){
  	var description = this.getGroupFactorDescription(g[e[o].group], groupBy);
  	groups[description].data.push(data[o].value);
  }
}
for(o in groups){
	var newObject = groups[o];
	if( newObject.data.length === 0){
		continue;
	}
	this.calculateStats(newObject);
	if(!this.isFiltered(newObject)){
		newObject.renderIndex = i;
		newObject.id = i++;
		innerArray.push(newObject);
	}
}
return innerArray;
};


ExpressionData.prototype.getGroupFactorDescription = function(o,groupBy){
	var factorArray = [];
	var factorNames = this.longFactorName;
  //console.log(factorNames);
  
  var numOfFactors = groupBy.length;
  var arr_offset = 0;
  for(var i in groupBy) {
  	var grpby = groupBy[i];

    // TODO: This is a patch.
    // We should have a list of elements that we don't
    // want to display
    if(grpby == "study"){
    	arr_offset ++;
    	continue;
    }

    var curr_fact = factorNames[grpby];
    var curr_short =  o.factors[groupBy[i]]; 
    var curr_long = curr_fact[curr_short];
    
    factorArray[i - arr_offset ] = curr_long;
    if(numOfFactors > 4 || curr_long.length > 15 ){
    	factorArray[i - arr_offset ] = curr_short;
    }
};
return factorArray.join(", ");
};

ExpressionData.prototype.getGroupFactorLongDescription = function(o,groupBy){
	var factorArray = [];
	var factorNames = this.longFactorName;
  	//console.log(factorNames);

  	var numOfFactors = groupBy.length;
  	for(var i in groupBy) {
  		var grpby = groupBy[i];
  		var curr_fact = factorNames[grpby];
  		var curr_short =  o.factors[groupBy[i]]; 
  		var curr_long = curr_fact[curr_short];
  		factorArray[i] = curr_long;

  	};
  	return factorArray.join(", ");
  };


  ExpressionData.prototype.getGroupFactor = function(o,groupBy){
  	var factorArray = {};
  	for (var i in groupBy) {
  		factorArray[groupBy[i]] = o.factors[groupBy[i]];
  	};
  	return factorArray;
  };


//To keep the indeces we reiterate and set them
ExpressionData.prototype.setRenderIndexes = function(to, from){
	for(var i in from){
		var gene=from[i];
		//console.log("setRenderIndexes");
		//console.log(gene);
		//console.log(to[i]);
		for(var j in gene){
			to[i][j].renderIndex = from[i][j].renderIndex;
		}
	}
};

ExpressionData.prototype.addSortPriority = function(factor, end){
	end = typeof end !== 'undefined' ? end : true;
	this.removeSortPriority(factor);
	if(end == true){
		this.sortOrder.push(factor);
	}else{
		this.sortOrder.unshift(factor);
	}

};

ExpressionData.prototype.removeSortPriority = function(factor){
 // console.log(this);

 var index = this.sortOrder.indexOf(factor);

 if (index > -1) {
 	this.sortOrder.splice(index, 1);
 }
};




require('biojs-events').mixin(ExpressionData.prototype);
module.exports.ExpressionData = ExpressionData;