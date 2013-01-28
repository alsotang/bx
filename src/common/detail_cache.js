/**
 * ��h5_cacheΪ�����洢�����json����
 * Ĭ�ϴ洢10���������� 
 * 
 */
define(function(require, exports, module){
  //�洢����10��
  var maxCount = 10,
      
	itemCacheKey = 'allspark_item_key',
        
   h5_cache = require('h5_cache');
   
   /***
   * ͨ��id��cache��ȡitem����
   * ��������ڷ��� null
   **/   
   exports.getItemById = function (id)
   {
	  return  h5_cache.getValue(itemCacheKey,id);	   
   }
   /***
   * ������������
   * id - ����id
   * jsondata - �����json����
   *  ����true or false
   **/ 
    exports.saveItem = function (id,jsonData)
   {
	  return  h5_cache.pushValue(itemCacheKey,id,jsonData,maxCount);   
   }
	  
});