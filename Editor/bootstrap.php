<div class="modal fade hide" id="newfuncModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="myModalLabel">New Function</h3>           
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="functionname" class="control-label">Function Name</label>
                            <input type="text" class="form-control" id="functionname"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
                    <button class="btn btn-primary" data-dismiss="modal" onclick="CreateNewFunction()">Create</button>
                </div>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<div class="modal fade hide" id="newvarModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="myModalLabel">New Variable</h3>
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            </div>
            <div class="modal-body">
                <form>
                    <label for="varname" class="control-label">Variable Name</label>
                    <input type="text" class="form-control" id="varname"></textarea>
                    <label for="vartype" class="control-label">Variable Type</label>
                    <div class="form-group" id="vartype">
                        <select>
                            <option>Int</option>
                            <option>Float</option>
                            <option>String</option>
                            <option>Bool</option>
                            <option>Object</option>
                        </select>
                    </div>
                    <label for="contype" class="control-label">Data Container</label>
                    <div class="form-group" id="contype">
                        <select>
                            <option>Single</option>
                            <option>Array</option>
                            <option>Map</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
                <button class="btn btn-primary" data-dismiss="modal">Create</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->