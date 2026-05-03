import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  ScrollView,
} from 'react-native';
import { getStates, getLGAsByState } from '@some19ice/nigeria-geo-core';

const PRIMARY = 'tomato';
const SECONDARY = 'skyblue';

const ADDRESS_TYPES = ['Home', 'Office', 'Other'];

const emptyForm = {
  id: '',
  FullName: '',
  Phone: '',
  State: '',
  Lga: '',
  StreetAddress: '',
  Landmark: '',
  DeliveryNote: '',
  SaveAddress: true,
  IsDefault: false,
  AddressType: 'Home',
};

const DeliveryAddressSection = ({
  value,
  onChange,
  onValidateChange,
  title = 'Delivery Address',
}) => {
  const [form, setForm] = useState({
    ...emptyForm,
    ...value,
  });

  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: '1',
      FullName: 'Suleiman Yusuf',
      Phone: '08012345678',
      State: 'Katsina',
      Lga: 'Kankara',
      StreetAddress: 'No. 2, Behind Central Market Road',
      Landmark: 'Near Mosque Junction',
      DeliveryNote: 'Call me on arrival',
      SaveAddress: true,
      IsDefault: true,
      AddressType: 'Home',
    },
  ]);
  const [editingId, setEditingId] = useState(null);

  const states = useMemo(() => {
    try {
      return (
        getStates()?.map((item) =>
          typeof item === 'string' ? item : item?.name || item?.state || ''
        ) || []
      );
    } catch (error) {
      return [];
    }
  }, []);

  const lgas = useMemo(() => {
    if (!form.State) return [];
    try {
      return (
        getLGAsByState(form.State)?.map((item) =>
          typeof item === 'string' ? item : item?.name || item?.lga || ''
        ) || []
      );
    } catch (error) {
      return [];
    }
  }, [form.State]);

  const selectedAddress = useMemo(() => {
    if (form?.StreetAddress) return form;
    return savedAddresses.find((item) => item.IsDefault) || savedAddresses[0] || null;
  }, [form, savedAddresses]);

  const updateField = (key, fieldValue) => {
    const updated = { ...form, [key]: fieldValue };

    if (key === 'State') {
      updated.Lga = '';
    }

    setForm(updated);
    onChange?.(updated);
  };

  const validate = (data) => {
    const newErrors = {};

    if (!data.FullName?.trim()) newErrors.FullName = 'Recipient name is required';
    if (!data.Phone?.trim()) {
      newErrors.Phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(data.Phone.replace(/\s/g, ''))) {
      newErrors.Phone = 'Enter a valid phone number';
    }

    if (!data.State?.trim()) newErrors.State = 'State is required';
    if (!data.Lga?.trim()) newErrors.Lga = 'LGA is required';
    if (!data.StreetAddress?.trim()) newErrors.StreetAddress = 'Street address is required';

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidateChange?.(isValid, newErrors);
    return isValid;
  };

  useEffect(() => {
    validate(form);
  }, [form]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      id: '',
    });
    setEditingId(null);
    setErrors({});
  };

  const handleSaveAddress = () => {
    const isValid = validate(form);
    if (!isValid) return;

    let updatedList = [...savedAddresses];

    if (form.IsDefault) {
      updatedList = updatedList.map((item) => ({ ...item, IsDefault: false }));
    }

    if (editingId) {
      updatedList = updatedList.map((item) =>
        item.id === editingId ? { ...form, id: editingId } : item
      );
    } else {
      updatedList.unshift({
        ...form,
        id: Date.now().toString(),
      });
    }

    if (!updatedList.some((item) => item.IsDefault) && updatedList.length > 0) {
      updatedList[0].IsDefault = true;
    }

    setSavedAddresses(updatedList);
    onChange?.(form);
    setExpanded(false);
    resetForm();
  };

  const handleEditAddress = (item) => {
    setForm(item);
    setEditingId(item.id);
    setExpanded(true);
  };

  const handleSelectAddress = (item) => {
    const updated = savedAddresses.map((address) => ({
      ...address,
      IsDefault: address.id === item.id,
    }));
    setSavedAddresses(updated);
    setForm(item);
    onChange?.(item);
    onValidateChange?.(true, {});
  };

  const handleDeleteAddress = (id) => {
    let updated = savedAddresses.filter((item) => item.id !== id);

    if (updated.length > 0 && !updated.some((item) => item.IsDefault)) {
      updated[0].IsDefault = true;
    }

    setSavedAddresses(updated);

    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Add, select, and manage where orders should be delivered
          </Text>
        </View>

        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => setExpanded((prev) => !prev)}
        >
          <Text style={styles.expandBtnText}>{expanded ? 'Hide' : 'Open'}</Text>
        </TouchableOpacity>
      </View>

      {selectedAddress && !expanded ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.previewCard}
          onPress={() => setExpanded(true)}
        >
          <View style={styles.previewHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedAddress.AddressType}</Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </View>

          <Text style={styles.previewName}>
            {selectedAddress.FullName} • {selectedAddress.Phone}
          </Text>
          <Text style={styles.previewText}>
            {selectedAddress.StreetAddress}, {selectedAddress.Lga}, {selectedAddress.State}
          </Text>
          {!!selectedAddress.Landmark && (
            <Text style={styles.previewSubText}>
              Landmark: {selectedAddress.Landmark}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}

      {expanded && (
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Saved Addresses</Text>

          {savedAddresses.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedAddressScroll}
            >
              {savedAddresses.map((item) => {
                const active = item.IsDefault;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.9}
                    style={[styles.savedCard, active && styles.savedCardActive]}
                    onPress={() => handleSelectAddress(item)}
                  >
                    <View style={styles.savedTopRow}>
                      <Text
                        style={[
                          styles.savedType,
                          active && { color: PRIMARY },
                        ]}
                      >
                        {item.AddressType}
                      </Text>

                      {active && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.savedName}>{item.FullName}</Text>
                    <Text style={styles.savedPhone}>{item.Phone}</Text>
                    <Text numberOfLines={2} style={styles.savedText}>
                      {item.StreetAddress}, {item.Lga}, {item.State}
                    </Text>

                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => handleEditAddress(item)}>
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No saved address yet</Text>
              <Text style={styles.emptyText}>
                Add your first delivery address for faster checkout.
              </Text>
            </View>
          )}

          <Text style={styles.sectionHeading}>
            {editingId ? 'Edit Address' : 'Add New Address'}
          </Text>

          <View style={styles.typeRow}>
            {ADDRESS_TYPES.map((type) => {
              const active = form.AddressType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  onPress={() => updateField('AddressType', type)}
                >
                  <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient Full Name</Text>
            <TextInput
              value={form.FullName}
              onChangeText={(text) => updateField('FullName', text)}
              placeholder="Enter full name"
              placeholderTextColor="#888"
              style={[styles.input, errors.FullName && styles.errorInput]}
            />
            {!!errors.FullName && <Text style={styles.errorText}>{errors.FullName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={form.Phone}
              onChangeText={(text) => updateField('Phone', text.replace(/[^0-9]/g, ''))}
              placeholder="08012345678"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              style={[styles.input, errors.Phone && styles.errorInput]}
            />
            {!!errors.Phone && <Text style={styles.errorText}>{errors.Phone}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>State</Text>
              <View style={[styles.selectBox, errors.State && styles.errorInput]}>
                <View style={styles.optionsWrap}>
                  {states.slice(0, 10).map((state) => {
                    const active = form.State === state;
                    return (
                      <TouchableOpacity
                        key={state}
                        onPress={() => updateField('State', state)}
                        style={[styles.optionChip, active && styles.activeChip]}
                      >
                        <Text style={[styles.optionText, active && styles.activeOptionText]}>
                          {state}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  value={form.State}
                  onChangeText={(text) => updateField('State', text)}
                  placeholder="Type state"
                  placeholderTextColor="#888"
                  style={styles.selectInput}
                />
              </View>
              {!!errors.State && <Text style={styles.errorText}>{errors.State}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>LGA</Text>
              <View style={[styles.selectBox, errors.Lga && styles.errorInput]}>
                <View style={styles.optionsWrap}>
                  {lgas.slice(0, 10).map((lga) => {
                    const active = form.Lga === lga;
                    return (
                      <TouchableOpacity
                        key={lga}
                        onPress={() => updateField('Lga', lga)}
                        style={[styles.optionChip, active && styles.activeChip]}
                      >
                        <Text style={[styles.optionText, active && styles.activeOptionText]}>
                          {lga}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  value={form.Lga}
                  onChangeText={(text) => updateField('Lga', text)}
                  placeholder="Type LGA"
                  placeholderTextColor="#888"
                  style={styles.selectInput}
                />
              </View>
              {!!errors.Lga && <Text style={styles.errorText}>{errors.Lga}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              value={form.StreetAddress}
              onChangeText={(text) => updateField('StreetAddress', text)}
              placeholder="House number, street, area"
              placeholderTextColor="#888"
              multiline
              style={[
                styles.input,
                styles.textArea,
                errors.StreetAddress && styles.errorInput,
              ]}
            />
            {!!errors.StreetAddress && (
              <Text style={styles.errorText}>{errors.StreetAddress}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Landmark</Text>
            <TextInput
              value={form.Landmark}
              onChangeText={(text) => updateField('Landmark', text)}
              placeholder="Nearby junction, school, mosque, market..."
              placeholderTextColor="#888"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note for Rider</Text>
            <TextInput
              value={form.DeliveryNote}
              onChangeText={(text) => updateField('DeliveryNote', text)}
              placeholder="Call me before arrival"
              placeholderTextColor="#888"
              multiline
              style={[styles.input, styles.textAreaSmall]}
            />
          </View>

          <View style={styles.switchCard}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Save this address</Text>
                <Text style={styles.switchDesc}>
                  Keep this address for your next orders
                </Text>
              </View>
              <Switch
                value={form.SaveAddress}
                onValueChange={(val) => updateField('SaveAddress', val)}
                thumbColor={form.SaveAddress ? PRIMARY : '#f4f4f4'}
                trackColor={{ false: '#ccc', true: '#ffd0c7' }}
              />
            </View>

            <View style={[styles.switchRow, { marginTop: 14 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Set as default</Text>
                <Text style={styles.switchDesc}>
                  Use this address automatically during checkout
                </Text>
              </View>
              <Switch
                value={form.IsDefault}
                onValueChange={(val) => updateField('IsDefault', val)}
                thumbColor={form.IsDefault ? SECONDARY : '#f4f4f4'}
                trackColor={{ false: '#ccc', true: '#cfefff' }}
              />
            </View>
          </View>

          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={resetForm}>
              <Text style={styles.secondaryBtnText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveAddress}>
              <Text style={styles.primaryBtnText}>
                {editingId ? 'Update Address' : 'Save Address'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default DeliveryAddressSection;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    marginBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  expandBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#eef9ff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bfe8ff',
  },
  expandBtnText: {
    color: '#1479a8',
    fontWeight: '700',
    fontSize: 12,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#fff2ee',
    borderColor: PRIMARY,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
  changeText: {
    color: SECONDARY,
    fontSize: 13,
    fontWeight: '700',
  },
  previewName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  previewText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  previewSubText: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
    marginTop: 6,
  },
  savedAddressScroll: {
    paddingBottom: 10,
    gap: 12,
  },
  savedCard: {
    width: 250,
    backgroundColor: '#fafafa',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ececec',
    marginRight: 12,
  },
  savedCardActive: {
    borderColor: PRIMARY,
    backgroundColor: '#fff7f4',
  },
  savedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  savedType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#e9f8ff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    color: '#1976a5',
    fontSize: 11,
    fontWeight: '700',
  },
  savedName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  savedPhone: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  savedText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 12,
  },
  editText: {
    color: SECONDARY,
    fontWeight: '700',
  },
  deleteText: {
    color: PRIMARY,
    fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: '#f8fcff',
    borderWidth: 1,
    borderColor: '#d9f0ff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  emptyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#f5f5f5',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeChipActive: {
    backgroundColor: '#fff2ee',
    borderColor: PRIMARY,
  },
  typeChipText: {
    color: '#555',
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: PRIMARY,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 14,
    color: '#111',
  },
  selectBox: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 14,
    padding: 10,
  },
  selectInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#111',
    marginTop: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  activeChip: {
    backgroundColor: '#fff1ed',
    borderColor: PRIMARY,
  },
  optionText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
  },
  activeOptionText: {
    color: PRIMARY,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    minHeight: 75,
    textAlignVertical: 'top',
  },
  switchCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f8fcff',
    borderWidth: 1,
    borderColor: '#d8f1ff',
  },
  switchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  switchDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#eef8ff',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccecff',
  },
  secondaryBtnText: {
    color: '#1976a5',
    fontWeight: '800',
    fontSize: 14,
  },
  primaryBtn: {
    flex: 1.3,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
});