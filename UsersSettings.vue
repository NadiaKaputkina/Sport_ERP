<template>
    <div class="row">
        <div class="col-md-12">
            <button class="btn btn-lg btn-default btn-block" @click="onToggleSection">
                <span class="section-title">
                    <h3>
                        {{settingName}} <i class="fa" :class="iconClass"></i>
                    </h3>
                </span>
                <span class="pull-right" @click.stop="onChangeEdit"><i class="fa fa-edit fa-2x"></i></span>
            </button>
        </div>
        <div class="col-md-12 mt-3" v-show="isSectionShow">
            <table class="table table-hover options-list bg-white">
                <thead>
                    <tr class="row">
                        <th class="col-md-1"></th>
                        <th class="col-md-3">Name</th>
                        <th class="col-md-4">Description</th>
                        <th class="col-md-2">System Color</th>
                        <th class="col-md-1">Default</th>
                        <th class="col-md-1"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="row" v-for="setting in propUnchangeableSettings">
                        <td class="col-md-1 text-center p-0">
                            <i class="fa fa-arrows" aria-hidden="true"></i>
                        </td>
                        <td class="col-md-3 p-0">{{ setting.name }}</td>
                        <td class="col-md-4 p-0">{{ descriptionPart(setting.description) }}</td>
                        <td class="col-md-2 text-center p-0">
                            <input type="text"
                                   class="form-control input-sm"
                                   v-model="setting.color"
                                   :style="background(setting.color)"
                                   readonly
                            />
                        </td>
                        <td class="col-md-1 text-center p-0">
                            <checkbox :id="setting.index"
                                      :checked="isChecked(setting.default)"
                                      :disabled="!userCan('@super_admin')"
                            ></checkbox>
                        </td>
                        <td class="col-md-1 text-center p-0"></td>
                    </tr>
                </tbody>
                <tbody data-role="sorted_table">
                    <tr class="row" v-for="setting in settings">
                        <td class="col-md-1 text-center p-0" :style="cursor">
                            <input type="text" hidden v-model="setting.index" data-role="setting_index">
                            <i class="fa fa-arrows" aria-hidden="true"></i>
                        </td>
                        <td class="col-md-3 p-0">
                            <input type="text"
                                   class="form-control input-sm"
                                   placeholder="Name"
                                   v-model="setting.name"
                                   v-if="isEditMode"
                            />
                            <template v-else>{{ setting.name }}</template>
                            <label class="error" v-if="isNotValidName(setting.index)">{{settingName}} name can not be
                                empty</label>
                        </td>
                        <td class="col-md-4 p-0">
                            <input type="text"
                                   class="form-control input-sm"
                                   placeholder="Description"
                                   v-model="setting.description"
                                   v-if="isEditMode"
                           />
                            <template v-else>{{ descriptionPart(setting.description) }}</template>
                        </td>
                        <td class="col-md-2 p-0">
                            <input type="text"
                                   class="form-control input-sm"
                                   v-model="setting.color"
                                   v-if="!isEditMode"
                                   :style="background(setting.color)"
                                   readonly
                            />
                            <input-color v-else
                                         :id="setting.index"
                                         :color="setting.color"
                                         @change-color="onChangeColor"
                            ></input-color>
                        </td>
                        <td class="col-md-1 text-center p-0">
                            <checkbox :id="setting.index"
                                      :checked="isChecked(setting.default)"
                                      :disabled="!isEditMode"
                                      :dataRole="`${settingName}-${setting.index}`"
                                      @change="onChangeChecked"
                            ></checkbox>
                        </td>
                        <td class="col-md-1 text-center p-0">
                            <button class="btn btn-default btn-sm"
                                    title="Delete Option"
                                    v-if="isEditMode"
                                    @click="removeField(setting.index)"
                            ><i class="fa fa-trash"></i></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="col-auto mr-auto" v-if="isSectionShow && isEditMode">
            <button class="btn btn-sm btn-success" :disabled="isBtnDisabled" @click="addNewField">Add new</button>
        </div>
        <div class="col-auto" v-if="isSectionShow && isEditMode">
            <button class="btn btn-sm btn-default" :disabled="isBtnDisabled" @click="onChangeEdit">Cancel</button>
            <button class="btn btn-sm btn-primary ladda-button" data-style="zoom-in" :disabled="isBtnDisabled" @click="onClickSave">Save Changes</button>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import InputColor from '../InputColor.vue';
    import Checkbox from '../Checkbox.vue';

    export default {
        name: "UsersSettings",

        components: {
            Checkbox,
            InputColor
        },

        props: {
            settingName: {
                type: String,
                default: ""
            },

            getDataUrl: {
                type: String,
                default: ""
            },

            saveUrl: {
                type: String,
                default: ""
            }
        },

        data: function() {
            return {
                isSectionShow: false,
                isEditMode: false,
                isBtnDisabled: false,

                propUnchangeableSettings: [],
                propSettings: null,
                settings: [],
                startSettings: [],
                removedSettings: [],
                emptyNameSettings: [],

                defaultSetting: {
                    index: 0,
                    name: '',
                    description: '',
                    color: '#FFFFFF',
                    default: 0,
                    sort: 0,
                },
                markers: null,
            }
        },

        computed: {
            iconClass() {
                return this.isSectionShow ? 'fa-chevron-up' : 'fa-chevron-down';
            },

            userCan() {
                return (marker) => {
                    return _.includes(this.markers, marker);
                }
            },

            cursor() {
                return 'cursor: ' + (this.isEditMode ? 'all-scroll' : 'default') + ';';
            },

            descriptionPart() {
                return (description) => {
                    if (_.isEmpty(description)) {
                        return description;
                    } else {
                        return description.substring(0, 20) + '...';
                    }
                }
            },

            settingNamePart() {
                return (name) => {
                    return name.substring(0, name.length - 1);
                }
            },

            isNotValidName() {
                return (index) => {
                    return _.intersection(this.emptyNameSettings, [index]).length > 0;
                }
            },

            background() {
                return (color) => {
                    return 'background-color: ' + color + ';';
                }
            },

            isChecked() {
                return (value) => {
                    return !!value;
                }
            }
        },

        mounted() {
            let $tbody = jQuery('[data-role="sorted_table"]');

            $tbody.sortable({
                update: () => {
                    $tbody.find('tr').each((index, tr) => {
                        let settingIndex = jQuery(tr).find('input[data-role="setting_index"]').val();
                        let setting = _.find(this.settings, ['index', parseInt(settingIndex)]);
                        setting.sort = index;
                    });
                }
            });

            $tbody.sortable('disable');
            this.loadData();
        },

        methods: {
            loadData() {
                axios.post(this.getDataUrl)
                    .then((response) => {
                        this.propSettings = response.data.settings;
                        this.markers = response.data.markers;

                        _.each(this.propSettings, (setting) => {
                            if (this.userCan('@super_admin') && setting.createdSuperAdmin) {
                                this.settings.push(setting);
                            } else if (!this.userCan('@super_admin') && !setting.createdSuperAdmin) {
                                this.settings.push(setting);
                            }
                            else {
                                this.propUnchangeableSettings.push(setting);
                            }
                        });

                        let index = 0;
                        _.each(this.settings, (item) => {
                            item.index = index;
                            item.sort = index;
                            index++;
                        });

                        this.startSettings = _.cloneDeep(this.settings);

                    }).catch(function (error) {
                    console.log(error);
                });
            },

            onToggleSection() {
                if (this.isBtnDisabled) {
                    return;
                }
                this.isSectionShow = !this.isSectionShow;
            },

            onChangeEdit() {
                if (this.isBtnDisabled) {
                    return;
                }

                if (this.isEditMode) {
                    this.endEdit();
                    this.revertData();
                }
                else {
                    this.startEdit();
                }
            },

            startEdit() {
                if (this.isSectionShow === false) {
                    this.isSectionShow = true;
                }
                this.isEditMode = true;

                let $tbody = jQuery('[data-role="sorted_table"]');
                $tbody.sortable('enable');
            },

            endEdit() {
                let $tbody = jQuery('[data-role="sorted_table"]');
                $tbody.sortable('disable');

                this.isEditMode = false;
                this.isBtnDisabled = false;
            },

            revertData() {
                this.settings = _.cloneDeep(this.startSettings);
                this.emptyNameSettings = [];
                this.removedSettings = [];
            },

            removeField(index) {
                swal({
                    title: "Are you sure?",
                    text: 'Delete this ' + this.settingNamePart(this.settingName) + '?',
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                }, (result) => {
                    if (result) {
                        this.onDeleteField(index);
                    } else {
                        swal.close();
                    }
                });

            },

            onDeleteField(index) {
                let settingIndex = _.findIndex(this.settings, ['index', index]);
                let setting = _.find(this.settings, ['index', index]);

                if (setting.default) {
                    let $checkbox = jQuery("input[data-role='" + this.settingName + "-" + index + "']");
                    $checkbox.parent().removeClass('checked');
                }

                if (_.has(setting, 'id')) {
                    this.removedSettings.push(setting);
                }

                this.settings.splice(settingIndex, 1);

                swal.close();
            },

            onChangeColor(index, color) {
                let settingIndex = _.findIndex(this.settings, ['index', index]);
                this.settings[settingIndex].color = color;
            },

            addNewField() {
                let settingWithMaxSort = _.maxBy(this.settings, 'sort');
                let settingWithMaxIndex = _.maxBy(this.settings, 'index');
                let defaultSetting = _.cloneDeep(this.defaultSetting);

                if (!_.isEmpty(settingWithMaxSort)) {
                    defaultSetting.sort = settingWithMaxSort.sort + 1;
                }

                if (!_.isEmpty(settingWithMaxIndex)) {
                    defaultSetting.index = settingWithMaxIndex.index + 1;
                }

                this.settings.push(defaultSetting);
            },

            validate() {
                this.emptyNameSettings = [];

                _.each(this.settings, (item) => {
                    if (item.name === '') {
                        this.emptyNameSettings.push(item.index);
                    }
                });
            },

            onChangeChecked(index) {
                _.each(this.settings, (item, i) => {
                    if (item.index !== index) {
                        this.settings[i].default = 0;
                    } else {
                        this.settings[i].default = 1;
                    }
                });
            },

            onClickSave() {
                let saveButton = $('button.ladda-button');
                let $lhgndb = Ladda.create(saveButton[0]);
                $lhgndb.start();

                this.validate();

                if (!_.isEmpty(this.emptyNameSettings)) {
                    $lhgndb.stop();
                    return;
                }

                if (this.isBtnDisabled) {
                    return;
                }

                this.isBtnDisabled = true;

                axios.post(this.saveUrl, {
                    settings: this.settings,
                    removedSettings: this.removedSettings,
                })
                    .then((response) => {
                        if (response.data.success) {
                            swal({
                                title: "Saved",
                                type: "success",
                                showCancelButton: false,
                            }, () => {
                                this.endEdit();
                                this.startSettings = _.cloneDeep(this.settings);
                                this.removedSettings = [];
                                $lhgndb.stop();
                            });
                        }
                    })
                    .catch((error) => {
                        swal({
                            title: "Error",
                            text: error.message,
                            type: "warning"
                        }, () => {
                            this.isBtnDisabled = false;
                        });
                    });
            }

        }
    }
</script>

<style>
    .section-title {
        float: left;
        margin-bottom: 5px;
        margin-top: 5px;
        font-size: 20px;
    }

    table.options-list tbody tr td {
        vertical-align: middle;
        height: 40px;
        padding: 0 !important;
        margin: 0 !important;
        border: 0 !important;
    }
</style>
