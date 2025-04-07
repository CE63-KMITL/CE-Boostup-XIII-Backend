import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { HouseScoreService } from './house_score.service';

@Controller('houseScores')
export class  HouseScoreController {
  constructor(private readonly scoreService: HouseScoreService) {}

  @Post()
  async create(@Body() body: { name: string; value: number }) {
    try {
      return await this.scoreService.create(body.name, body.value);
    } catch (error) {
      return { success: false, message: error.response.message };  
    }
  }

  @Put(':name')
  async update(@Param('name') name: string, @Body() body: { value: number }) {
    try {
      return await this.scoreService.changeScore(name, body.value);
    } catch (error) {
      return { success: false, message: error.response.message };  
    }
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    try {
      return await this.scoreService.findOne(name);
    } catch (error) {
      return { success: false, message: error.response.message }; 
    }
  }

  @Get()
  async findAll(@Query('order') order?: 'ASC' | 'DESC') { //ASC จากน้อยไปมาก DESC จากมากไปน้อย วิธีใช้ /?order=___
    try {
      return order ? await this.scoreService.findAllSorted(order) : await this.scoreService.findAll();
    } catch (error) {
      return { success: false, message: error.response.message }; 
    }
  }

  @Delete(':name')
  async remove(@Param('name') name: string) {
    try {
      return await this.scoreService.remove(name);
    } catch (error) {
      return { success: false, message: error.response.message }; 
    }
  }

  // เพิ่มคะแนน
  @Put('add/:name')
  async addScore(@Param('name') name: string, @Body() body: { value: number }) {
    try {
      return await this.scoreService.addScore(name, body.value);
    } catch (error) {
      return { success: false, message: error.response.message }; 
    }
  }

  // ลดคะแนน
  @Put('subtract/:name')
  async subtractScore(@Param('name') name: string, @Body() body: { value: number }) {
    try {
      return await this.scoreService.subtractScore(name, body.value);
    } catch (error) {
      return { success: false, message: error.response.message };
    }
  }
}
