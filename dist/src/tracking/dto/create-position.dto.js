"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePositionDto = void 0;
const class_validator_1 = require("class-validator");
class CreatePositionDto {
    childId;
    lat;
    lng;
    accuracy;
    speed;
    heading;
    altitude;
}
exports.CreatePositionDto = CreatePositionDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del niño es requerido' }),
    __metadata("design:type", Number)
], CreatePositionDto.prototype, "childId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La latitud es requerida' }),
    (0, class_validator_1.Min)(-90, { message: 'Latitud debe estar entre -90 y 90' }),
    (0, class_validator_1.Max)(90, { message: 'Latitud debe estar entre -90 y 90' }),
    __metadata("design:type", Number)
], CreatePositionDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La longitud es requerida' }),
    (0, class_validator_1.Min)(-180, { message: 'Longitud debe estar entre -180 y 180' }),
    (0, class_validator_1.Max)(180, { message: 'Longitud debe estar entre -180 y 180' }),
    __metadata("design:type", Number)
], CreatePositionDto.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePositionDto.prototype, "accuracy", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePositionDto.prototype, "speed", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePositionDto.prototype, "heading", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePositionDto.prototype, "altitude", void 0);
//# sourceMappingURL=create-position.dto.js.map